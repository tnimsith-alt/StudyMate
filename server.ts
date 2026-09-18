import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as archiverModule from 'archiver';
import dotenv from 'dotenv';

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

  // AI Tutor endpoint
  app.post('/api/ask-tutor', async (req, res) => {
    try {
      const { question, language, subject } = req.body;
      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY is not set in environment.');
        return res.json({
          text: language === 'si'
            ? `💡 සටහන: GEMINI_API_KEY තවමත් සකසා නැත (කරුණාකර Settings > Secrets තුළින් එක් කරන්න).\n\nඔබගේ ප්‍රශ්නය: "${question.trim()}" (${subject || 'A/L General'})\n\n📚 සාමාන්‍ය A/L උපදෙස්:\n• සංකල්ප ප්‍රථමයෙන් ගැඹුරින් අධ්‍යයනය කරන්න.\n• පසුගිය විභාග ප්‍රශ්න පත්‍ර (Past Papers) කාල සීමාවක් තබා විසඳන්න.\n• විශේෂයෙන්ම SI ඒකක සහ සූත්‍ර මතක තබා ගන්න.`
            : `💡 Note: GEMINI_API_KEY is not set in the environment (you can attach it in the Settings > Secrets panel).\n\nRegarding your question: "${question.trim()}" in ${subject || 'A/L General'}:\n\n📚 General A/L Study Tips:\n• Master the core definitions and principles in the syllabus.\n• Pay close attention to standard units, derivations, and algebraic accuracy.\n• Practice past exam papers under timed conditions to build exam temperament.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const systemInstruction = language === 'si'
        ? `ඔබ ශ්‍රී ලංකා උසස් පෙළ (G.C.E. Advanced Level - A/L) සිසුවෙකුට උදව් කරන සුහදශීලී, විශේෂඥ විෂය ගුරුවරයෙකි. භෞතික විද්‍යාව (Physics), රසායන විද්‍යාව (Chemistry), සංයුක්ත ගණිතය (Combined Mathematics - Pure & Applied), හෝ ජීව විද්‍යාව (Biology) විෂය නිර්දේශයට අනුකූලව පැහැදිලි, පියවරෙන් පියවර විග්‍රහයක් සිංහලෙන් සපයන්න. සූත්‍ර, උදාහරණ, සහ විභාග ලකුණු ගැනීමේ උපක්‍රම (exam tips) සුදුසු පරිදි Markdown ආකෘතියෙන් ඇතුළත් කරන්න.`
        : `You are an expert, supportive AI academic tutor tailored specifically for Sri Lankan G.C.E. Advanced Level (A/L) students (covering Physics, Chemistry, Combined Mathematics, Biology, and ICT). Provide clear, step-by-step conceptual breakdowns, formulas, derivations where appropriate, and practical exam tips. Format with clear Markdown headings, bullet points, and code/math blocks.`;

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-flash-lite-latest',
        'gemini-flash-latest'
      ];

      let answer: string | undefined;
      let lastErr: unknown;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: `Subject context: ${subject || 'A/L General'}\nStudent Question: ${question.trim()}`,
            config: { systemInstruction }
          });
          if (response.text) {
            answer = response.text;
            break;
          }
        } catch (mErr) {
          lastErr = mErr;
          console.warn(`Model ${modelName} call failed, trying next fallback...`, mErr);
        }
      }

      if (!answer) {
        // Provide resilient offline response if API rate limit or network issue occurs
        const fallbackText = language === 'si'
          ? `### 📚 A/L විෂය උපදේශය (${subject || 'General'})\n\n**ප්‍රශ්නය:** ${question.trim()}\n\n*සටහන: AI සේවාව තාවකාලිකව අධික තදබදයක පවතී (Rate limit). කෙසේ වෙතත්, පහත අධ්‍යයන උපක්‍රම අනුගමනය කරන්න:*\n\n1. **මූලික සූත්‍ර සහ අර්ථ දැක්වීම්** මතකයේ තබා ගන්න.\n2. **පසුගිය ප්‍රශ්න පත්‍ර (Past Papers)** විවරණ සමඟ නැවත බලන්න.\n3. සංකීර්ණ ගැටළු පියවර කිහිපයකට කඩා විසඳන්න.\n4. විභාග ප්‍රශ්න පත්‍රයේ ලකුණු දෙන ආකාරය (Marking Scheme) කෙරෙහි සැලකිලිමත් වන්න.`
          : `### 📚 A/L Study Reference Guide (${subject || 'General'})\n\n**Topic / Question:** ${question.trim()}\n\n*Note: The AI service is experiencing heavy traffic or quota rate limits. Here is your offline study guidance:*\n\n1. **Core Concept Mastery**: Break the problem down into fundamental physical principles or mathematical definitions.\n2. **Formula Application**: Ensure standard SI units and dimensional consistency before substituting numbers.\n3. **Past Paper Technique**: Review Sri Lankan A/L marking schemes for this topic to ensure structured presentation and full step marks.\n4. **Daily Practice**: Attempt at least 2 structured essay questions under timed exam conditions.`;

        return res.json({ text: fallbackText });
      }

      return res.json({ text: answer });
    } catch (err: unknown) {
      console.error('Tutor error:', err);
      const message = err instanceof Error ? err.message : 'Server error occurred';
      return res.status(200).json({ 
        text: `### 💡 Quick A/L Study Tip\n\nWe couldn't reach the AI model right now (${message}), but you can continue using all your study tools: Syllabus tracker, Focus Timer, Exam Results, and Subject Notes!` 
      });
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
