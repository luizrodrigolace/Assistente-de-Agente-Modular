import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
  // Nota: Futuramente, a lógica de autenticação REAL deve envolver Contexts/Services
  // (Seguindo a Propless Arch), mas por agora, apenas roteamos.

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz vai para a tela de Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Tela de Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Tela do Chat */}
        <Route path="/chat" element={<ChatPage />} />
        
        {/* Rota 404 básica */}
        <Route path="*" element={<h1>404 | Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;