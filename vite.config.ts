import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function apiPlugin(): Plugin {
  return {
    name: 'api-tutor-middleware',
    configureServer(server) {
      server.middlewares.use('/api/ask-tutor', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { question, language, subject } = JSON.parse(body || '{}');
            if (!question) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Question is required' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                text: language === 'si'
                  ? `[නිරීක්ෂණ මාදිලිය]: කරුණාකර Settings > Secrets තුළ GEMINI_API_KEY එක් කරන්න.\n\nඔබගේ ප්‍රශ්නය: "${question}"\n\nවිභාග උපදෙස්:\n• සංකල්ප නිවැරදිව තේරුම් ගන්න.\n• පසුගිය විභාග ප්‍රශ්න පත්‍ර (Past Papers) වැඩිපුර කරන්න!`
                  : `[Preview Mode]: Please configure your GEMINI_API_KEY in Settings > Secrets.\n\nRegarding "${question}" in ${subject || 'A/L General'}:\n• Review fundamental formulas and laws.\n• Pay special attention to dimensional analysis and SI units.\n• Solve recent past paper problems to master time management!`
              }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemInstruction = language === 'si'
              ? `ඔබ ශ්‍රී ලංකා උසස් පෙළ (G.C.E. A/L) සිසුවෙකුට උදව් කරන සුහද, දැනුමැති ගුරුවරයෙකි. ප්‍රශ්න සඳහා පියවරෙන් පියවර පැහැදිලි, නිවැරදි, සහ පහසුවෙන් තේරුම් ගත හැකි පැහැදිලි කිරීමක් සිංහලෙන් ලබා දෙන්න. අවශ්‍ය තැන්වලදී සූත්‍ර, උදාහරණ, සහ විභාග උපදෙස් ඇතුළත් කරන්න.`
              : `You are a supportive, knowledgeable expert tutor for a Sri Lankan G.C.E. Advanced Level (A/L) student studying subjects like Physics, Chemistry, Pure Mathematics, and Applied Mathematics. Provide clear, step-by-step explanations, key formulas, conceptual breakdowns, and practical exam tips. Use clean formatting and bullet points where helpful.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: `Subject context: ${subject || 'A/L General'}\nStudent Question: ${question}`,
              config: {
                systemInstruction,
              },
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: response.text }));
          } catch (err: unknown) {
            console.error('API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Failed to generate tutor explanation' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
