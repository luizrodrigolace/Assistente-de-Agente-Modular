import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatService } from '../contexts/ChatContext';

// Estilos inline para animação suave
const fadeInStyle = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(2px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Adiciona os estilos ao head se ainda não existirem
if (typeof document !== 'undefined') {
  const styleId = 'chat-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = fadeInStyle;
    document.head.appendChild(style);
  }
}

const ChatPage: React.FC = () => {
  // O componente consome o contexto (Correto)
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useChatService();
  
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial' }}>
      
      {/* Header (Correto) */}
      <header /* ... */ >
        <h2>Assistente Agentic Zaia 🧠</h2>
        <button onClick={handleLogout} /* ... */ >
          Sair
        </button>
      </header>
      
      {/* Área de Mensagens (Scrollable) */}
      <main style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9' }}>
        
        {/* // ===================================================================
        // 💡💡💡 O STREAMING ACONTECE EXATAMENTE AQUI 💡💡💡
        // ===================================================================
        //
        // Você não precisa fazer um loop, um 'onData' ou nada complexo.
        // O hook 'useChat' (no seu Context) recebe os chunks do backend e
        // ATUALIZA o 'content' da última mensagem no array 'messages'.
        // 
        // Por exemplo:
        // 1. Chunk 1: 'messages' vira [... { role: 'assistant', content: 'Olá' }]
        // 2. (React re-renderiza)
        // 3. Chunk 2: 'messages' vira [... { role: 'assistant', content: 'Olá,' }]
        // 4. (React re-renderiza)
        // 5. Chunk 3: 'messages' vira [... { role: 'assistant', content: 'Olá, co' }]
        // 6. (React re-renderiza)
        // 
        // O seu 'messages.map' simplesmente renderiza o estado mais recente
        // de 'messages' muito rapidamente. Isso *é* o streaming.
        //
        */}
        {messages.length > 0 ? (
          messages.map(m => {
            // No AI SDK v5, o conteúdo está em m.parts, não em m.content
            // Extrai o texto de todos os parts do tipo 'text'
            const textContent = m.parts
              ?.filter((part: any) => part.type === 'text')
              .map((part: any) => part.text || part.textDelta || '')
              .join('') || m.content || '';
            
            return (
              <div key={m.id} style={{
                  marginBottom: '10px',
                  textAlign: m.role === 'user' ? 'right' : 'left'
              }}>
              <span style={{
                display: 'inline-block',
                padding: '10px 15px',
                borderRadius: '18px',
                maxWidth: '70%',
                backgroundColor: m.role === 'user' ? '#c4d7f5' : '#e0e0e0',
                color: '#333',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                // Animações suaves para melhor fluidez visual
                transition: 'all 0.1s ease-out',
                animation: m.role === 'assistant' && textContent.length < 100 ? 'fadeIn 0.3s ease-in' : 'none'
              }}>
                {textContent} {/* <-- É ISSO QUE MOSTRA O STREAMING */}
              </span>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>
            Olá! Sou seu assistente Agentic. Digite algo para começar... 💬
          </p>
        )}
        
        {/* Indicador de "Digitando..." (Correto) */}
        {isLoading && (
          <div style={{ marginTop: '10px', textAlign: 'left', color: '#5c6ac4', paddingLeft: '20px' }}>
            <div style={{ display: 'inline-block', padding: '10px 15px', borderRadius: '18px', backgroundColor: '#e0e0e0' }}>
              Digitando...
            </div>
          </div>
        )}
      </main>
      
      {/* Input de Chat (Correto) */}
      <footer style={{ padding: '15px', borderTop: '1px solid #ddd', backgroundColor: '#f4f4f4' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <button type="button" /* ... */>📎</button>
          <input
            type="text"
            placeholder="Pergunte sobre clima, cotações ou envie um PDF..."
            value={input || ''}
            onChange={handleInputChange}
            style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#5c6ac4', color: 'white', cursor: 'pointer' }}
            disabled={isLoading || !input?.trim()}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;