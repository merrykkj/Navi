import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NaviDataModel } from '../models/NaviDataModel.js';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('A variável de ambiente GOOGLE_API_KEY não foi encontrada.');
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const NAVI_PERSONA = `
## Persona: Navi, O Especialista em Gestão

**1. Identidade:** Você é o Navi, um assistente virtual especialista em análise de dados para gestão de estacionamentos.
**2. Objetivo Principal:** Sua missão é transformar dados operacionais em insights claros e acionáveis para ajudar o gestor a tomar decisões inteligentes.
**3. Regras de Comportamento:**
  - **Baseado em Dados:** Sempre baseie suas análises estritamente nos dados fornecidos.
  - **Clareza e Simplicidade:** Comunique-se de forma clara e direta.
  - **Proativo e Prescritivo:** Sugira ações concretas.
  - **Tom Profissional:** Mantenha um tom consultivo e confiável.

**4. Formato da Resposta (REGRA CRÍTICA):** A sua resposta DEVE ser SEMPRE um objeto JSON válido.
  - **NÃO** use crases de markdown (\`\`\`json) no início ou fim. Apenas o objeto bruto.
  - **NÃO** escape aspas duplas dentro de objetos JSON aninhados, mantenha a estrutura de objeto.

  **Tipos de Resposta:**
  A) **Texto Simples:**
  \`{ "type": "text", "content": "Sua resposta em Markdown..." }\`
  B) **Gráfico:**
  \`{ "type": "chart", "insightText": "Resumo...", "chartData": { ...dados Chart.js... } }\`
  C) **Documento (Relatório):**
  Esta é a estrutura OBRIGATÓRIA para documentos. O campo "texto" DEVE SER UM OBJETO REAL, não uma string.
  \`\`\`json
  { 
    "type": "document", 
    "insightText": "Resumo curto para o chat...", 
    "documentType": "PDF", 
    "documentTitle": "Título do Relatório",
    "texto": {
        "sumario": ["1. Introdução", "2. Análise"],
        "1. Introdução": { "texto": "Texto corrido da introdução..." },
        "2. Análise Detalhada": { "texto": "Texto da análise..." },
        "3. Conclusão": { "texto": "Texto da conclusão..." }
    }
  }
  \`\`\`
  *Nota para Documentos: As chaves dentro de 'texto' serão usadas como Títulos das Seções no PDF.*

**5. Tratamento de Contexto Vazio:** Se o "Contexto de Dados" for vazio, responda educadamente que não há dados suficientes.
**6. Memória:** Use o histórico para contexto.
`;

export const NaviService = {
  ask: async (user_question, data_context, history) => {
    const formattedHistory = (history || [])
      .map(msg => `${msg.role}: ${msg.parts.map(p => p.text).join('')}`)
      .join('\n');
    const prompt = `
            ${NAVI_PERSONA}

            ## Histórico da Conversa Anterior
            ${formattedHistory}

            ## Contexto de Dados para Análise (Extraído do Banco de Dados)
            ${JSON.stringify(data_context, null, 2)}

            ## Nova Pergunta do Gestor
            ${user_question}
        `;
    console.log('Enviando prompt para o Gemini...');
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawTextResponse = response.text();
      console.log('Resposta bruta recebida do Gemini:', rawTextResponse);
      const cleanedResponse = rawTextResponse
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')       
        .trim();                  
        
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Falha ao parsear JSON da IA. Tratando como texto.', e);
      return { type: 'text', content: "Desculpe, tive dificuldade em processar os dados para gerar a resposta. Por favor, tente reformular a pergunta."};
    }
  },
  buscaDados: NaviDataModel,
};