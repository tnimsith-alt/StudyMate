import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

import { generateCurriculumResponse } from './src/utils/tutorKnowledge';

function apiPlugin(): Plugin {
  return {
    name: 'api-tutor-middleware',
    configureServer(server) {
      const handleTutorRequest = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { question, language, subject } = JSON.parse(body || '{}');
            if (!question || typeof question !== 'string' || !question.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Question is required' }));
              return;
            }

            const cleanQuestion = question.trim();
            const studentLanguage: 'en' | 'si' = language === 'si' ? 'si' : 'en';
            const studentSubject: string = subject || 'A/L General';
            const apiKey = process.env.GEMINI_API_KEY;

            const systemInstruction = studentLanguage === 'si'
              ? `ඔබ ශ්‍රී ලංකා උසස් පෙළ (G.C.E. Advanced Level - A/L) සිසුවෙකුට උදව් කරන සුහදශීලී, විශේෂඥ විෂය ගුරුවරයෙකි. භෞතික විද්‍යාව (Physics), රසායන විද්‍යාව (Chemistry), සංයුක්ත ගණිතය (Combined Mathematics), හෝ ජීව විද්‍යාව (Biology) විෂය නිර්දේශයට අනුකූලව පැහැදිලි, පියවරෙන් පියවර විග්‍රහයක් සිංහලෙන් සපයන්න.`
              : `You are an expert academic tutor for a Sri Lankan G.C.E. Advanced Level (A/L) student studying Physics, Chemistry, Combined Mathematics, Biology, and ICT. Provide clear, step-by-step conceptual breakdowns, formulas, and practical exam tips.`;

            let answer: string | undefined;

            if (apiKey) {
              const modelsToTry = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: { 'User-Agent': 'aistudio-build' },
                },
              });

              const dynamicPrompt = `Subject: ${studentSubject}\nStudent Question: ${cleanQuestion}`;

              for (const modelName of modelsToTry) {
                try {
                  const response = await ai.models.generateContent({
                    model: modelName,
                    contents: dynamicPrompt,
                    config: { systemInstruction },
                  });

                  if (response?.text && response.text.trim()) {
                    answer = response.text.trim();
                    console.log(`[Vite AI Tutor] Success with model "${modelName}"!`);
                    break;
                  }
                } catch (sdkErr: any) {
                  console.warn(`[Vite AI Tutor SDK] Model "${modelName}" failed:`, sdkErr?.status || sdkErr?.message || sdkErr);

                  // Direct REST fallback
                  try {
                    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                    const restRes = await fetch(restUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'aistudio-build'
                      },
                      body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: dynamicPrompt }] }],
                        systemInstruction: { parts: [{ text: systemInstruction }] }
                      })
                    });
                    if (restRes.ok) {
                      const restData: any = await restRes.json();
                      const textResult = restData?.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (textResult && textResult.trim()) {
                        answer = textResult.trim();
                        console.log(`[Vite AI Tutor REST] Success with model "${modelName}"!`);
                        break;
                      }
                    }
                  } catch (restErr) {
                    console.warn(`[Vite AI Tutor REST] Error on "${modelName}":`, restErr);
                  }
                }
              }
            }

            if (!answer) {
              answer = generateCurriculumResponse(cleanQuestion, studentSubject, studentLanguage);
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: answer }));
          } catch (err: unknown) {
            console.error('[Vite Middleware Unhandled Error]:', err);
            const fallback = generateCurriculumResponse('General Guidance', 'General', 'en');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: fallback }));
          }
        });
      };

      server.middlewares.use('/api/ask-tutor', handleTutorRequest);
      server.middlewares.use('/api/tutor', handleTutorRequest);
      server.middlewares.use('/api/ask-ai', handleTutorRequest);
      server.middlewares.use('/api/gemini', handleTutorRequest);
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
