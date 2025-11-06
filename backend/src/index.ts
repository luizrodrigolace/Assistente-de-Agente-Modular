import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq'; 

// 🛑 DEFINIÇÃO MANUAL DOS TIPOS (PARA EVITAR A IMPORTAÇÃO QUEBRADA)
interface UIMessage {
  id?: string;
  role: 'user' | 'assistant';
  content?: string;
  parts?: Array<{ type: string; text?: string; textDelta?: string }>;
}
interface CoreMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}
function convertToCore(messages: UIMessage[]): CoreMessage[] {
  console.log("[BACKEND] Convertendo UIMessages para CoreMessages...");
  if (messages.length === 0) {
     return [{ role: 'user', content: 'Hello' }]; // Fallback
  }
  return messages.map(msg => {
    // No AI SDK v5, mensagens podem ter 'parts' ao invés de 'content'
    let content = msg.content || '';
    
    if (msg.parts && msg.parts.length > 0) {
      // Extrai texto de todos os parts do tipo 'text'
      content = msg.parts
        .filter(part => part.type === 'text')
        .map(part => part.text || part.textDelta || '')
        .join('');
    }
    
    return {
      role: msg.role,
      content: content || 'Hello',
    };
  });
}

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001; 

// --- Configurações ---
app.use(express.json()); 
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
}));

// --- Inicialização do LLM (Groq) ---
const groq = createGroq({ 
  apiKey: process.env.GROQ_API_KEY, 
});

// --- ROTA DE CHAT (COM STREAMING CORRETO PARA useChat) ---
app.post('/chat', async (req: Request, res: Response) => {
  console.log("\n[BACKEND] --- ROTA /chat ATINGIDA ---"); 
  
  try {
    // 1. Loga o corpo da requisição (Correto)
    console.log("[BACKEND] 1. Recebido req.body:", JSON.stringify(req.body, null, 2));
    
    const { messages } = req.body as { messages: UIMessage[] }; 

    if (!messages || !Array.isArray(messages)) {
      console.error("[BACKEND] ERRO: 'messages' não é um array ou está ausente.");
      return res.status(400).send('Corpo da requisição ausente ou "messages" inválido.');
    }

    // 2. Loga as mensagens convertidas (Correto)
    const coreMessages = convertToCore(messages);
    console.log("[BACKEND] 2. Mensagens convertidas para Core:", JSON.stringify(coreMessages, null, 2));

    // 3. Loga antes da chamada da IA (Correto)
    console.log("[BACKEND] 3. Chamando streamText com o modelo Groq...");
    const result = await streamText({
      // ⚠️ CUIDADO: Verifique se este nome de modelo está correto para Groq.
      // Exemplos: 'llama3-8b-8192', 'gemma-7b-it'
      model: groq('groq/compound'), 
      messages: coreMessages as any, // Cast temporário para compatibilidade de tipos
    });

    // 4. ✅ CORREÇÃO: Tenta usar toUIMessageStreamResponse se disponível, senão cria manualmente
    console.log("[BACKEND] 4. streamText retornou. Criando stream no formato do AI SDK...");
    
    try {
      // Tenta usar o método do result se disponível
      if (typeof (result as any).toUIMessageStreamResponse === 'function') {
        console.log("[BACKEND] 4.1. Usando toUIMessageStreamResponse do result...");
        const streamResponse = (result as any).toUIMessageStreamResponse();
        const reader = streamResponse.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
          }
          res.end();
          console.log("[BACKEND] 5. Stream finalizado usando toUIMessageStreamResponse.");
          return;
        }
      }
      
      // Fallback: cria o stream manualmente no formato correto
      console.log("[BACKEND] 4.2. Criando stream manualmente...");
      
      // Configura os headers corretos para streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      // Força o flush dos headers imediatamente
      res.flushHeaders();
      
      let chunkCounter = 0;
      let fullResponse = '';
      let messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // O useChat v5 espera o formato UI Message Stream com structure de parts
      // Primeiro envia o início da mensagem
      const initialChunk = `0:{"type":"message-start","id":"${messageId}","role":"assistant"}\n\n`;
      res.write(initialChunk);
      // Força o flush imediato
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
      console.log("[BACKEND] 4.3. Enviado chunk inicial da mensagem");

      // Para cada chunk de texto, envia como text-delta
      for await (const textDelta of result.textStream) {
        fullResponse += textDelta;
        
        // Formato correto: text-delta com textDelta
        const textDeltaChunk = {
          type: 'text-delta',
          textDelta: textDelta
        };
        const contentChunk = `0:${JSON.stringify(textDeltaChunk)}\n\n`;
        res.write(contentChunk);
        
        // Força o flush imediato para melhor fluidez
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
        
        // Log menos frequente para não sobrecarregar
        if (chunkCounter % 10 === 0) {
          console.log(`[BACKEND] 4.${chunkCounter + 4}. Enviando Chunk ${chunkCounter}: "${textDelta.substring(0, 20)}..."`);
        }
        chunkCounter++;
      }

      // Envia o fim da mensagem
      const finalChunk = `0:{"type":"message-finish","id":"${messageId}"}\n\n`;
      res.write(finalChunk);
      res.write('0:[DONE]\n\n');
      
      console.log("[BACKEND] 5. Stream finalizado com sucesso.");
      console.log("[BACKEND] 6. Resposta completa da IA:", fullResponse);
      res.end();
      
    } catch (streamError) {
      console.error('[BACKEND] ERRO durante o streaming:', streamError);
      throw streamError;
    }

  } catch (error) {
    console.error('[BACKEND] ERRO CRÍTICO no endpoint /chat (stream):', error);
    // Garante que a resposta termine em caso de erro
    if (!res.headersSent) {
      res.status(500).send('Erro interno do servidor durante o streaming da IA.'); 
    } else {
      res.end();
    }
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});