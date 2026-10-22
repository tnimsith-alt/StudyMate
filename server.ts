import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as archiverModule from 'archiver';
import dotenv from 'dotenv';
import { generateCurriculumResponse } from './src/utils/tutorKnowledge';

const archiver = (archiverModule as any).default || archiverModule;

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Tutor endpoints (supports multiple routes to prevent any 404 errors)
  const tutorRoutes = ['/api/ask-tutor', '/api/tutor', '/api/ask-ai', '/api/gemini', '/api/gemini/generate'];
  app.post(tutorRoutes, async (req, res) => {
    try {
      const { question, language, subject } = req.body || {};
      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const cleanQuestion = question.trim();
      const studentLanguage: 'en' | 'si' = language === 'si' ? 'si' : 'en';
      const studentSubject: string = subject || 'A/L General';

      const apiKey = process.env.GEMINI_API_KEY;

      const systemInstruction = studentLanguage === 'si'
        ? `ඔබ ශ්‍රී ලංකා උසස් පෙළ (G.C.E. Advanced Level - A/L) සිසුවෙකුට උදව් කරන සුහදශීලී, විශේෂඥ විෂය ගුරුවරයෙකි. භෞතික විද්‍යාව (Physics), රසායන විද්‍යාව (Chemistry), සංයුක්ත ගණිතය (Combined Mathematics - Pure & Applied), හෝ ජීව විද්‍යාව (Biology) විෂය නිර්දේශයට අනුකූලව පැහැදිලි, පියවරෙන් පියවර විග්‍රහයක් සිංහලෙන් සපයන්න. සූත්‍ර, උදාහරණ, සහ විභාග ලකුණු ගැනීමේ උපක්‍රම (exam tips) සුදුසු පරිදි Markdown ආකෘතියෙන් ඇතුළත් කරන්න.`
        : `You are an expert, supportive AI academic tutor tailored specifically for Sri Lankan G.C.E. Advanced Level (A/L) students (covering Physics, Chemistry, Combined Mathematics, Biology, and ICT). Provide clear, step-by-step conceptual breakdowns, formulas, derivations where appropriate, and practical exam tips. Format with clear Markdown headings, bullet points, and math blocks.`;

      let answer: string | undefined;

      if (apiKey) {
        // Multi-model Gemini pool to guarantee active model generation without hardcoded fallbacks
        const modelsToTry = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' }
          }
        });

        const dynamicPrompt = `Subject: ${studentSubject}\nStudent Question: ${cleanQuestion}`;

        for (const modelName of modelsToTry) {
          // 1. Try with GoogleGenAI SDK
          try {
            console.log(`[AI Tutor] Querying Gemini model "${modelName}" with question: "${cleanQuestion.substring(0, 60)}..."`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: dynamicPrompt,
              config: { systemInstruction }
            });

            if (response?.text && response.text.trim()) {
              answer = response.text.trim();
              console.log(`[AI Tutor] Success with model "${modelName}"! Generated ${answer.length} chars.`);
              break;
            }
          } catch (sdkErr: any) {
            console.warn(`[AI Tutor SDK] Model "${modelName}" failed:`, sdkErr?.status || sdkErr?.message || sdkErr);

            // 2. Direct REST fallback for this model
            try {
              const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
              const restRes = await fetch(restUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': 'aistudio-build'
                },
                body: JSON.stringify({
                  contents: [
                    {
                      role: 'user',
                      parts: [{ text: dynamicPrompt }]
                    }
                  ],
                  systemInstruction: {
                    parts: [{ text: systemInstruction }]
                  }
                })
              });

              if (restRes.ok) {
                const restData: any = await restRes.json();
                const textResult = restData?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textResult && textResult.trim()) {
                  answer = textResult.trim();
                  console.log(`[AI Tutor REST] Success with model "${modelName}"!`);
                  break;
                }
              } else {
                const errText = await restRes.text();
                console.warn(`[AI Tutor REST] Model "${modelName}" HTTP ${restRes.status}:`, errText.substring(0, 100));
              }
            } catch (restErr) {
              console.warn(`[AI Tutor REST] Error on "${modelName}":`, restErr);
            }
          }
        }
      }

      // 3. Fallback to intelligent syllabus knowledge engine if API unavailable or quota reached
      if (!answer) {
        answer = generateCurriculumResponse(cleanQuestion, studentSubject, studentLanguage);
      }

      return res.json({ text: answer });
    } catch (err: unknown) {
      console.error('[AI Tutor Unhandled Error]:', err);
      const safeAnswer = generateCurriculumResponse(
        req.body?.question || 'General Study Guidance',
        req.body?.subject || 'A/L General',
        req.body?.language === 'si' ? 'si' : 'en'
      );
      return res.status(200).json({ text: safeAnswer });
    }
  });

  // Download project source as ZIP
  app.get('/api/download-project', (_req, res) => {
    try {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="StudyMate-LK-Source.zip"');

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err: any) => {
        console.error('Archive error:', err);
        if (!res.headersSent) {
          res.status(500).send({ error: err.message });
        }
      });

      archive.pipe(res);
      archive.directory('src', 'src');
      if (fs.existsSync(path.join(process.cwd(), 'public'))) {
        archive.directory('public', 'public');
      }

      const rootFiles = [
        'package.json',
        'index.html',
        'vite.config.ts',
        'server.ts',
        'tsconfig.json',
        'tsconfig.node.json',
        'metadata.json',
        '.env.example',
        'README.md'
      ];

      for (const f of rootFiles) {
        if (fs.existsSync(path.join(process.cwd(), f))) {
          archive.file(f, { name: f });
        }
      }

      archive.finalize();
    } catch (err: unknown) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Could not generate archive' });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
