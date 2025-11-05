import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // A autenticação é mockada. Ao clicar, apenas navegamos para o chat.
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula um login bem-sucedido e redireciona
    navigate('/chat'); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial' }}>
      <h1>Bem-vindo ao Projeto Zaia</h1>
      <p>O primeiro passo é entrar (Mocked Auth)</p>
      
    <form onSubmit={handleLogin} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" placeholder="Email" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        <input type="password" placeholder="Senha" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        
        <button type="submit" style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#5c6ac4', color: 'white', cursor: 'pointer' }}>
          Entrar e Começar 🚀
        </button>
      </form>
    </div>
  );
};

export default LoginPage;