/**
 * Este é o coração da nossa "The Propless Architecture".
 * Ele encapsula toda a comunicação com o backend e o estado.
 * As páginas e componentes UI apenas "chamam" os métodos aqui, sem saber
 * detalhes como 'fetch' ou 'axios' (se fôssemos usar).
 */

// Define a URL base do nosso backend (Node.js) que está na porta 3001
const BASE_URL = 'http://localhost:3001';

// Este será o serviço central que toda a aplicação usará
export const apiService = {
    
  /**
   * Chamada para o nosso health check (Fase 1.2)
   */
  async getHealthStatus() {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      // O fetch moderno é 'ok' para verificar sucesso HTTP
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao verificar o health check:", error);
      // Retorna um status de erro para a UI tratar
      return { status: 'error', message: 'Backend indisponível.' };
    }
  }
  
  // Aqui ficarão os métodos futuros como 'streamChat()' e 'uploadPDF()'
};