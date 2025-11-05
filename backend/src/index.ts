import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
// 👈 IMPORTAR O CORS
import cors from 'cors'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// 👈 CONFIGURAR O CORS ANTES DOS SEUS ENDPOINTS
app.use(cors({
    origin: '*', // Permite qualquer origem (ideal para desenvolvimento)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
}));

app.use(express.json());

// --- Endpoint de Health Check ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend está funcionando perfeitamente!' 
  });
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});