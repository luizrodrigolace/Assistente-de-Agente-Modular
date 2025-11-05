import React from 'react';
// Este será o container principal do nosso chat. Na Fase 2, ele receberá a lógica real.

const ChatPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial' }}>
      
      {/* Header */}
      <header style={{ padding: '15px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
        <h2>Assistente Agentic Zaia 🧠</h2>
      </header>
      
      {/* Área de Mensagens (Scrollable) */}
      <main style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#fff' }}>
        <p>Olá! Sou seu assistente Agentic. Estou pronto para verificar o clima, buscar cotações e ler PDFs.</p>
        {/* Futuras mensagens da IA e do Usuário virão aqui */}
      </main>
      
      {/* Input de Chat */}
      <footer style={{ padding: '15px', borderTop: '1px solid #ddd', backgroundColor: '#f4f4f4' }}>
        <form style={{ display: 'flex', gap: '10px' }}>
          {/* O componente de Upload de PDF entrará aqui */}
          <button type="button" style={{ padding: '10px', backgroundColor: '#ccc', borderRadius: '4px', border: 'none' }}>📎</button>
          
          <input 
            type="text" 
            placeholder="Pergunte sobre clima, cotações ou envie um PDF..." 
            style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            disabled // Desativado até a Fase 2 (Streaming)
          />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#5c6ac4', color: 'white' }} disabled>
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;