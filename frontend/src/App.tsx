import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
// Importa o Provider Smart (o Serviço de Estado do Chat)
import { ChatProvider } from './contexts/ChatContext'; 

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Rota raiz: Redireciona para o Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Tela de Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Tela do Chat: Envolvida pelo Provider Smart (ChatContext) */}
        <Route path="/chat" element={
          <ChatProvider>
            <ChatPage /> 
          </ChatProvider>
        } />
        
        {/* Rota 404 básica */}
        <Route path="*" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>404 | Página não encontrada</h1>
            <p>Ocorreu um erro de roteamento.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;