import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useChat } from '@ai-sdk/react';

// Definição da interface (Correta)
interface ChatContextType {
  messages: any[];
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

// O Provider: Lógica inteligente de API e estado
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // 💡 Você gerencia o input manualmente com useState. Funciona.
  const [input, setInput] = useState('');

  // 💡 'useChat' gerencia 'messages' e 'isLoading'.
  // 'messages' é o array que será atualizado A CADA CHUNK.
  const chatHelpers = useChat({
    // Configura a URL do backend usando o proxy do Vite
    api: '/api/chat',
    
    // 🛑 LOGS DE DEBUG DO useChat 🛑
    onResponse: (response: any) => {
      console.log("[FRONTEND] 3. Recebida resposta do backend (Status):", response?.status);
      if (response?.headers) {
        console.log("[FRONTEND] 3.1. Content-Type:", response.headers.get('content-type'));
      }
    },
    onError: (err: any) => {
      console.error("[FRONTEND] ERRO CRÍTICO no hook useChat:", err);
    },
    onFinish: (result: any) => {
      console.log("[FRONTEND] 4. Stream finalizado. Result:", result);
      console.log("[FRONTEND] 4.1. Message parts:", result?.message?.parts);
      if (result.isError) {
        console.error("[FRONTEND] 4.2. Erro no stream:", result);
      }
    }
  } as any);

  const { messages, sendMessage } = chatHelpers;
  const isLoading = false; // Temporário até descobrirmos a propriedade correta

  // Log para monitorar quando as mensagens são atualizadas (útil para debug do streaming)
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      // No AI SDK v5, o conteúdo está em parts
      const textContent = lastMessage.parts
        ?.filter((part: any) => part.type === 'text')
        .map((part: any) => part.text || part.textDelta || '')
        .join('') || '';
      
      console.log(`[FRONTEND] Mensagem atualizada. Parts: ${lastMessage.parts?.length || 0}, Conteúdo: "${textContent.substring(0, 50)}${textContent.length > 50 ? '...' : ''}" (${textContent.length} chars)`);
    }
  }, [messages]);

  // 🛑 Seu handler customizado. Funciona.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 🛑 Seu submit customizado. Funciona.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    console.log(`[FRONTEND] 1. handleSubmit chamado. Enviando: "${trimmedInput}"`);

    // 'sendMessage' é o que inicia o processo de streaming.
    // No AI SDK v5, usamos parts ao invés de content
    sendMessage({ 
      parts: [{ type: 'text', text: trimmedInput }],
      role: 'user' 
    } as any);
    
    console.log("[FRONTEND] 2. 'sendMessage' foi chamado. Esperando resposta...");
    setInput(''); // Limpa o input
  };

  const value: ChatContextType = {
    messages, // 👈 Vindo do useChat (ESSENCIAL PARA O STREAMING)
    input,    // 👈 Vindo do useState
    isLoading, // 👈 Vindo do useChat
    handleInputChange, // 👈 Vindo do handler customizado
    handleSubmit,      // 👈 Vindo do handler customizado
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Hook customizado (useChatService) (Correto)
export const useChatService = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatService deve ser usado dentro de um ChatProvider');
  }
  return context;
};