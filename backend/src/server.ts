const fastify = require('fastify'); 
const cors = require('@fastify/cors');
const { OpenAI } = require('openai');
require('dotenv').config();

import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';

async function startServer(){
    console.log('Iniciando servidor...')

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const server = fastify();

    //permite que o front(3000) faça chamadas para o back(3001)
    await server.register(cors ,{
        origin: 'http://localhost:3000'
    });

    //define uma interface para o corpo da requisição
    interface ChatRequest {
        messages: ChatCompletionMessageParam[]
    }

    server.post(
        '/chat-stream', 
        async (
            request: FastifyRequest<{ Body: ChatRequest }>,
            reply: FastifyReply
        ) => {
            try{
                //pega mensagens do corpo da requisição
                const {messages} = request.body;

                //chama api em modo streaming
                const responseStream = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: messages,
                    stream: true,
                });

                // 6. Define o cabeçalho da resposta para indicar um stream
                reply.header('Content-Type', 'application/octet-stream');

                //envia o stream da openAI diretamente para a resposta
                // .toReadableStream() converte o stream da OpenAI
                // para um formato que o fastify entende
                reply.send(responseStream.toReadableStream());

            } catch (error){
                console.error('Erro ao chamar OpenAI',error);
                reply.status(500).send({error: 'Falha ao processar o chat'});
            }
        }
    );

    server.listen(
        {port: 3001},
        (err:FastifyError|null,address:string) => {
            if(err){
                console.error(err);
                process.exit(1);
            }
            console.log(`Servidor AI rodando em ${address}` )
        }
    );
}

startServer().catch(err=> {
    console.error('Falha ao iniciar o servidor:', err);
})


