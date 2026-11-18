import 'dotenv/config';
import express from 'express';
import type {Request, Response} from 'express';
import http from 'http';
import path from 'path';
import {fileURLToPath} from 'url';
import {GoogleGenAI, ThinkingLevel, Type} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please verify your API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatApiError(err: unknown): {status: number; message: string} {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID') || raw.includes('403')) {
    return {
      status: 403,
      message: 'API key permission issue. Please check your API key in Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message: 'Quota limit reached (429). You can upgrade or select a billing-enabled key in Settings > Secrets.',
    };
  }
  return {
    status: 500,
    message: raw || 'Unexpected Gemini API error occurred.',
  };
}

// In-memory LRU cache for generated WAV base64 audio clips
const ttsCache = new Map<string, string>();
const MAX_TTS_CACHE = 100;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({limit: '12mb'}));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ok: true});
  });

  // 1. Human-like Arabic Text-to-Speech (Gemini 3.8 Flash Lite TTS)
  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const {text, voice = 'Kore'} = req.body as {
        text?: string;
        voice?: string;
      };

      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({error: 'Text is required for speech synthesis.'});
        return;
      }

      const cleanText = text.trim().slice(0, 350);
      const cacheKey = `${voice}::${cleanText}`;
      const cached = ttsCache.get(cacheKey);
      if (cached) {
        res.json({audioBase64: cached, mimeType: 'audio/wav', cached: true});
        return;
      }

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Pronounce clearly in authentic classical/standard Arabic with accurate Makharij and vowel lengths: ${cleanText}`,
                speechMetadata: {
                  style: 'Clear, warm, articulate Arabic Quranic and language teacher',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice === 'Charon' ? 'Charon' : 'Kore',
              },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({error: 'No audio stream returned from speech model.'});
        return;
      }

      if (ttsCache.size >= MAX_TTS_CACHE) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey) ttsCache.delete(oldestKey);
      }
      ttsCache.set(cacheKey, base64Audio);

      res.json({audioBase64: base64Audio, mimeType: 'audio/wav', cached: false});
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({error: formatted.message});
    }
  });

  // 2. AI Pronunciation & Makharij Assessment (Audio Transcription + Pedagogical Rubric)
  app.post('/api/pronunciation-check', async (req: Request, res: Response) => {
    try {
      const {
        audioBase64,
        mimeType = 'audio/webm',
        targetArabic,
        targetTranslit = '',
        targetMeaning = '',
        lang = 'bn',
        ageMode = 'standard',
      } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        targetArabic?: string;
        targetTranslit?: string;
        targetMeaning?: string;
        lang?: 'bn' | 'en';
        ageMode?: 'kids' | 'standard' | 'senior';
      };

      if (!audioBase64 || !targetArabic) {
        res.status(400).json({error: 'Recorded audio and target Arabic phrase are required.'});
        return;
      }

      const ai = getGenAIClient();
      const cleanMime = mimeType.split(';')[0] || 'audio/webm';
      const audioPart = {
        inlineData: {
          mimeType: cleanMime,
          data: audioBase64,
        },
      };

      // Step A: Transcribe with gemini-3.5-transcribe
      const transcribeRes = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Transcribe the Arabic words or letter sounds heard in this recording into Arabic script. If silent or background noise only, output [SILENT].',
            },
          ],
        },
      });
      const heardTranscript = (transcribeRes.text ?? '').trim();

      // Step B: Detailed Makharij & Tajweed feedback with gemini-4-hydrogen
      const languageName = lang === 'bn' ? 'natural, effortless Bangla (বাংলা)' : 'clear, friendly English';
      const personaGuide =
        ageMode === 'kids'
          ? 'Speak warmly like a cheerful Ustad teaching a 7-year-old child with simple imagery.'
          : ageMode === 'senior'
          ? 'Speak respectfully, patiently, and reassuringly for an elder learner (55+ years).'
          : 'Provide concise, actionable Makharij (articulation) and vowel-length coaching.';

      const evalRes = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            audioPart,
            {
              text: `Evaluate this learner's Arabic pronunciation.
Target Arabic: ${targetArabic} (${targetTranslit} — ${targetMeaning})
Initial STT Transcript: ${heardTranscript}
Output Language for explanations: ${languageName}
Tone: ${personaGuide}`,
            },
          ],
        },
        config: {
          thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accuracyPercent: {
                type: Type.INTEGER,
                description: 'Estimated pronunciation score from 0 to 100. 0-20 if silent.',
              },
              status: {
                type: Type.STRING,
                description: 'One of: EXCELLENT, GOOD, PRACTICE_NEEDED',
              },
              heardArabic: {
                type: Type.STRING,
                description: 'Arabic script representation of what the learner uttered, or — if silent.',
              },
              makhrajTip: {
                type: Type.STRING,
                description: 'Specific tongue, throat, lip, or nasal placement advice in the requested UI language.',
              },
              tajweedNote: {
                type: Type.STRING,
                description: 'Note on Harakat, Madd elongation, Qalqalah, or Ghunnah in the requested UI language.',
              },
              encouragement: {
                type: Type.STRING,
                description: 'Short warm encouragement line in the requested UI language.',
              },
            },
            required: [
              'accuracyPercent',
              'status',
              'heardArabic',
              'makhrajTip',
              'tajweedNote',
              'encouragement',
            ],
          },
        },
      });

      const parsed = JSON.parse((evalRes.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({error: formatted.message});
    }
  });

  // 3. Virtual Ustad & Spoken Arabic Roleplay Tutor (gemini-4-hydrogen)
  app.post('/api/ustad-chat', async (req: Request, res: Response) => {
    try {
      const {
        messages = [],
        mode = 'ustad',
        lang = 'bn',
        ageMode = 'standard',
        track = 'quran',
        scenario = 'general',
      } = req.body as {
        messages?: Array<{role: 'user' | 'assistant'; content: string}>;
        mode?: 'ustad' | 'roleplay';
        lang?: 'bn' | 'en';
        ageMode?: 'kids' | 'standard' | 'senior';
        track?: 'quran' | 'msa' | 'gulf';
        scenario?: string;
      };

      const ai = getGenAIClient();
      const uiLang = lang === 'bn' ? 'Bangla (সহজ ও সাবলীল বাংলা)' : 'English';
      const systemInstruction = `You are "Virtual Ustad" inside Arbi Sikkhi (আরবি শিখি), a Zero-to-Expert Arabic & Quranic learning platform.
UI Explanation Language: ${uiLang}.
Learner Age Mode: ${ageMode} (kids = ages 3-12 playful & ultra-simple; standard = ages 13-50 structured root/grammar/Tajweed depth; senior = ages 51-90 extra clear, calm, respectful, zero jargon).
Active Curriculum Track: ${track} (quran = Quranic Arabic & Tajweed & Makharij; msa = Modern Standard Fusha A1-C2; gulf = Saudi/Gulf Spoken dialect alongside MSA).
Interaction Mode: ${
        mode === 'roleplay'
          ? `Real-world Arabic Roleplay Conversation (${scenario}). Respond with a natural Arabic line first, translate it into ${uiLang}, gently correct any mistake the learner made, and suggest what they can say next.`
          : `Zero-Tutor Virtual Ustad Q&A. Explain any Arabic word, Quranic ayah word-by-word, 3-letter root (الجذر), Makhraj articulation point, or Tajweed rule effortlessly in ${uiLang}.`
      }
Keep responses concise, structured, and immediately helpful.`;

      const historyText = messages
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'Learner' : 'Ustad'}: ${m.content}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: historyText || 'Assalamu Alaikum! Help me start learning Arabic step by step.',
        config: {
          systemInstruction,
          thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: {
                type: Type.STRING,
                description: 'Main explanation or conversational guidance in the UI language (Bangla or English).',
              },
              arabicPhrase: {
                type: Type.STRING,
                description: 'Key Arabic phrase, word, or Quranic example WITH full Harakat (Tashkeel).',
              },
              arabicUnvowelled: {
                type: Type.STRING,
                description: 'The exact same Arabic phrase WITHOUT Harakat for unvowelled reading practice.',
              },
              transliteration: {
                type: Type.STRING,
                description: 'Clear phonetic pronunciation in Bangla script (if lang=bn) or Latin script (if lang=en).',
              },
              meaning: {
                type: Type.STRING,
                description: 'Direct translation of the Arabic phrase in Bangla or English.',
              },
              coachTip: {
                type: Type.STRING,
                description: 'Root letters (الجذر), Tajweed rule, Makhraj tip, or Saudi/Gulf vs MSA note in UI language.',
              },
            },
            required: [
              'replyText',
              'arabicPhrase',
              'arabicUnvowelled',
              'transliteration',
              'meaning',
              'coachTip',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({error: formatted.message});
    }
  });

  // 4. AI-Powered Smart Daily Schedule Generator (gemini-4-hydrogen)
  const scheduleCache = new Map<string, unknown>();
  const MAX_SCHEDULE_CACHE = 60;

  app.post('/api/smart-schedule', async (req: Request, res: Response) => {
    try {
      const {
        learnerName = 'Learner',
        ageMode = 'standard',
        dailyGoalTier = 'consistent',
        targetMinutes = 15,
        todayMinutesStudied = 0,
        preferredTrack = 'quran',
        masteredLettersCount = 0,
        completedStagesCount = 0,
        currentStageTitle = '01. Shape Families & Minimal-Pair Makharij',
        srsDueCount = 6,
        focusPreference = 'balanced',
        lang = 'bn',
        forceRefresh = false,
      } = req.body as {
        learnerName?: string;
        ageMode?: 'kids' | 'standard' | 'senior';
        dailyGoalTier?: 'casual' | 'consistent' | 'intensive';
        targetMinutes?: number;
        todayMinutesStudied?: number;
        preferredTrack?: 'quran' | 'msa' | 'gulf';
        masteredLettersCount?: number;
        completedStagesCount?: number;
        currentStageTitle?: string;
        srsDueCount?: number;
        focusPreference?: 'balanced' | 'makhraj' | 'quran_vocab' | 'speaking';
        lang?: 'bn' | 'en';
        forceRefresh?: boolean;
      };

      const safeMinutes = Math.max(5, Math.min(60, Number(targetMinutes) || 15));
      const cacheKey = JSON.stringify({
        ageMode,
        dailyGoalTier,
        safeMinutes,
        preferredTrack,
        masteredLettersCount,
        completedStagesCount,
        currentStageTitle,
        focusPreference,
        lang,
      });

      if (!forceRefresh && scheduleCache.has(cacheKey)) {
        res.json(scheduleCache.get(cacheKey));
        return;
      }

      const ai = getGenAIClient();
      const uiLang = lang === 'bn' ? 'natural, clear Bangla (সহজ ও সুন্দর বাংলা)' : 'clear, motivating English';
      const blockCountRule =
        safeMinutes <= 5
          ? 'Create exactly 2 short micro-sessions whose durationMinutes add up to 5 (e.g., 2 + 3).'
          : safeMinutes <= 15
          ? 'Create exactly 3 focused study blocks whose durationMinutes add up to 15 (e.g., 4 + 6 + 5).'
          : `Create 3 or 4 structured study blocks whose durationMinutes add up to ${safeMinutes} (e.g., 6 + 10 + 8 + 6).`;

      const ageAdaptationRule =
        ageMode === 'kids'
          ? 'Age Group: Kids (3–12). Use joyful, playful Multisensory Dual-Coding micro-activities (shape stories, voice game, short listening bursts, zero heavy grammar jargon).'
          : ageMode === 'senior'
          ? 'Age Group: Senior (51–90). Use low-cognitive-load, calm, reassuring pacing (0.7x slow clear listening, familiar Salah Surahs, zero rushed drills).'
          : 'Age Group: Standard (13–50). Use interleaved cognitive spacing (warm-up Makhraj/minimal-pairs -> active core stage/morphology -> spaced retrieval/speaking).';

      const systemInstruction = `You are an expert Arabic & Quranic learning scientist designing a personalized "Smart Daily Schedule" inside Arbi Sikkhi (আরবি শিখি).
Output Language for all text fields (except focusArabicSample): ${uiLang}.
${ageAdaptationRule}
${blockCountRule}
Allowed values for sessionType ONLY:
- "makhraj_drill" (28 Letters, Sagittal Vocal Tract & Comet Stroke Lab)
- "harakat_rhythm" (Short vowels, Sukoon, Shaddah & Madd beat meter)
- "voice_quiz" (Web Speech AI Voice-Activated Makhraj Quiz)
- "surah_review" (Word-by-Word Quranic Surah & Tajweed Lab)
- "root_explorer" (3-Letter Arabic Root الجذر Multiplier Lab)
- "srs_flashcards" (SM-2 Spaced Repetition Vocabulary Deck)
- "spoken_dialogue" (Side-by-side MSA & Saudi/Gulf Spoken Dialogues)
- "ustad_coaching" (Virtual Ustad Q&A or Live Roleplay Tutor)
- "pathway_stage" (Current Step-by-Step Scientific Stage interactive lesson)
Always include authentic vowelled Arabic (with Tashkeel/Harakat) in focusArabicSample.`;

      const prompt = `Compose today's intentional Smart Daily Schedule for:
- Learner: ${learnerName}
- Daily Goal Tier: ${dailyGoalTier} (${safeMinutes} minutes total target; ${todayMinutesStudied} min completed so far today)
- Chosen Curriculum Track: ${preferredTrack} (quran = 0-to-Quran Expert; msa = Modern Standard Arabic A1-C2; gulf = Saudi & Gulf Spoken)
- Current Progress Stage: "${currentStageTitle}" (${completedStagesCount}/12 scientific stages done, ${masteredLettersCount}/28 Arabic letters mastered, ${srsDueCount} SRS review cards due)
- Today's Requested Focus Bias: ${focusPreference}${forceRefresh ? ` (Variation seed: ${Date.now() % 1000})` : ''}`;

      let lastErr: unknown = null;
      let rawText = '';

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              systemInstruction,
              thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  planHeadline: {
                    type: Type.STRING,
                    description: 'Concise, motivating headline for today’s schedule in the requested UI language.',
                  },
                  pedagogicalSummary: {
                    type: Type.STRING,
                    description: '1-2 sentences explaining why this session sequence fits the learner’s age mode, goal, and current stage.',
                  },
                  optimalTimeHint: {
                    type: Type.STRING,
                    description: 'Short suggestion for ideal study rhythm/time of day in the requested UI language.',
                  },
                  totalMinutes: {
                    type: Type.INTEGER,
                    description: 'Total minutes across all sessions, matching targetMinutes.',
                  },
                  sessions: {
                    type: Type.ARRAY,
                    description: 'Ordered list of 2 to 4 concrete study sessions.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sessionOrder: {
                          type: Type.INTEGER,
                          description: '1-indexed order of the session.',
                        },
                        title: {
                          type: Type.STRING,
                          description: 'Specific session title (e.g., "5-Min Throat Makhraj Drill" or "৫ মিনিট মাখরাজ অনুশীলন").',
                        },
                        durationMinutes: {
                          type: Type.INTEGER,
                          description: 'Duration in minutes for this specific block.',
                        },
                        sessionType: {
                          type: Type.STRING,
                          description: 'One of: makhraj_drill, harakat_rhythm, voice_quiz, surah_review, root_explorer, srs_flashcards, spoken_dialogue, ustad_coaching, pathway_stage.',
                        },
                        focusArabicSample: {
                          type: Type.STRING,
                          description: 'Short vowelled Arabic letter pair, word, or Quranic phrase to practice in this block.',
                        },
                        actionableGoal: {
                          type: Type.STRING,
                          description: 'Clear 1-sentence instruction of what the learner will do during this session.',
                        },
                        cognitiveReason: {
                          type: Type.STRING,
                          description: 'Short 2-5 word pedagogical label (e.g., Acoustic Priming, Active Recall, Tajweed Fluency).',
                        },
                        xpReward: {
                          type: Type.INTEGER,
                          description: 'Suggested XP reward between 10 and 30.',
                        },
                      },
                      required: [
                        'sessionOrder',
                        'title',
                        'durationMinutes',
                        'sessionType',
                        'focusArabicSample',
                        'actionableGoal',
                        'cognitiveReason',
                        'xpReward',
                      ],
                    },
                  },
                },
                required: [
                  'planHeadline',
                  'pedagogicalSummary',
                  'optimalTimeHint',
                  'totalMinutes',
                  'sessions',
                ],
              },
            },
          });
          rawText = (response.text ?? '').trim();
          if (rawText) break;
        } catch (err) {
          lastErr = err;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 450));
          }
        }
      }

      if (!rawText) {
        throw lastErr || new Error('Empty schedule response from model.');
      }

      const parsed = JSON.parse(rawText);
      if (scheduleCache.size >= MAX_SCHEDULE_CACHE) {
        const oldest = scheduleCache.keys().next().value;
        if (oldest) scheduleCache.delete(oldest);
      }
      scheduleCache.set(cacheKey, parsed);
      res.json(parsed);
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({error: formatted.message});
    }
  });

  const httpServer = http.createServer(app);
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: isHmrDisabled ? false : {server: httpServer},
      },
      plugins: isHmrDisabled
        ? [
            {
              name: 'aistudio-disable-client-ws',
              enforce: 'post',
              transform(code: string, id: string) {
                if (id.includes('vite/dist/client/client.mjs')) {
                  return code
                    .replace(
                      'transport.connect(createHMRHandler(handleMessage));',
                      '/* HMR WebSocket disabled via DISABLE_HMR */'
                    )
                    .replace(
                      'setupForwardConsoleHandler(transport, forwardConsole);',
                      '/* forwardConsole WebSocket disabled via DISABLE_HMR */'
                    );
                }
                return null;
              },
            },
          ]
        : [],
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Arbi Sikkhi server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
