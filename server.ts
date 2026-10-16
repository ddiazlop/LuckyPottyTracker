import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
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

// AI Potty Training Insights Endpoint
app.post('/api/ai/potty-insights', async (req: Request, res: Response) => {
  try {
    const {
      dogName = 'Lucky',
      breed = 'Golden Retriever',
      isPuppy = false,
      targetIntervalHours = 4,
      totalLogs = 0,
      totalPees = 0,
      totalPoops = 0,
      totalMeals = 0,
      totalAccidents = 0,
      outdoorSuccessRate = 100,
      avgHoldTimeHours = 4,
      avgMinutesToPoopAfterMeal = null,
      locationBreakdown = { Walk: 0, Terrace: 0, Park: 0, Indoors: 0 },
      timeOfDayBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 },
      lastPeeAgo = 'unknown',
      lastPoopAgo = 'unknown',
      lastMealAgo = 'unknown',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Local fallback if API key is not configured
      const fallbackTips = isPuppy
        ? [
            `Take ${dogName} out ${avgMinutesToPoopAfterMeal ? `around ${avgMinutesToPoopAfterMeal}m` : '15-30m'} after each meal, as digestion naturally triggers bowel motility.`,
            `When using the Terrace or going on Walks, mark successful elimination with a high-value treat within 2 seconds.`,
            `Keep feeding times strictly consistent to stabilize predictable elimination windows.`,
          ]
        : [
            avgMinutesToPoopAfterMeal
              ? `${dogName} consistently needs to poop ~${avgMinutesToPoopAfterMeal} minutes after eating. Time post-meal walks around this exact window!`
              : `Take ${dogName} for a walk 30–45 minutes after feeding to support the natural post-meal gastrocolic reflex.`,
            `Pair the cue word right as ${dogName} squats at ${locationBreakdown.Walk >= locationBreakdown.Terrace ? 'Walks' : 'the Terrace'} to solidify outdoor association.`,
            `Keep walks consistent at regular intervals to maintain the ${outdoorSuccessRate}% clean record.`,
          ];

      return res.json({
        success: true,
        source: 'local_coach',
        insights: {
          summary: `${dogName} is doing well with an outdoor success rate of ${outdoorSuccessRate}%. Daytime holding average is currently around ${avgHoldTimeHours} hours${avgMinutesToPoopAfterMeal ? `, and elimination occurs ~${avgMinutesToPoopAfterMeal}m after meals` : ''}.`,
          keyPattern: `Most activity occurs during ${
            timeOfDayBuckets.morning >= timeOfDayBuckets.evening ? 'Morning & Midday' : 'Evening'
          } outings, primarily on ${
            locationBreakdown.Walk >= locationBreakdown.Terrace ? 'Walks' : 'the Terrace'
          }${avgMinutesToPoopAfterMeal ? ` with a ~${avgMinutesToPoopAfterMeal} min post-meal potty pattern` : ''}.`,
          tips: fallbackTips,
          recommendedNextStep: avgMinutesToPoopAfterMeal
            ? `Schedule an outing ~${avgMinutesToPoopAfterMeal} minutes after ${dogName}'s next meal.`
            : `Plan the next outing within ${avgHoldTimeHours}h of the last potty break.`,
          statusMood: outdoorSuccessRate >= 90 ? 'excellent' : outdoorSuccessRate >= 75 ? 'steady' : 'needs_attention',
        },
      });
    }

    const prompt = `Analyze the following real dog potty & feeding tracking log for a dog named ${dogName}:
- Breed: ${breed}
- Life stage: ${isPuppy ? 'Puppy (learning)' : 'Adult'}
- Target owner hold goal: ${targetIntervalHours} hours
- Realized average hold time: ${avgHoldTimeHours} hours
- Total logged events: ${totalLogs} (${totalPees} pees, ${totalPoops} poops, ${totalMeals} meals)
- Indoor accidents (Indoors is always an accident): ${totalAccidents}
- Outdoor success rate: ${outdoorSuccessRate}%
- Location counts: Walk: ${locationBreakdown.Walk || 0}, Terrace: ${locationBreakdown.Terrace || 0}, Park: ${locationBreakdown.Park || 0}, Indoors: ${locationBreakdown.Indoors || 0}
- Daypart distribution: Morning: ${timeOfDayBuckets.morning}, Afternoon: ${timeOfDayBuckets.afternoon}, Evening: ${timeOfDayBuckets.evening}, Night: ${timeOfDayBuckets.night}
- Average delay between meal and poop: ${avgMinutesToPoopAfterMeal ? `${avgMinutesToPoopAfterMeal} minutes` : 'not enough paired data'}
- Last Pee: ${lastPeeAgo}
- Last Poop: ${lastPoopAgo}
- Last Meal: ${lastMealAgo}

Provide an encouraging, behavioral potty-training summary and 3 concrete, personalized action tips for the owner right now, highlighting the correlation between meal times and potty timing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a certified positive-reinforcement canine behaviorist and puppy potty training expert. Provide practical, supportive, tailored guidance based on the dog tracking data. Never use markdown headers or lists in the summary field.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'A 2-sentence encouraging summary of the dog current potty routine state and progress.',
            },
            keyPattern: {
              type: Type.STRING,
              description: 'One key pattern spotted in their time of day or location habits (e.g. Morning walk consistency, Terrace frequency).',
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 short, actionable, positive-reinforcement potty training tips for this specific dog state.',
            },
            recommendedNextStep: {
              type: Type.STRING,
              description: 'Immediate recommendation for the owner upcoming outing window.',
            },
            statusMood: {
              type: Type.STRING,
              enum: ['excellent', 'steady', 'needs_attention'],
              description: 'Overall training progress assessment.',
            },
          },
          required: ['summary', 'keyPattern', 'tips', 'recommendedNextStep', 'statusMood'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    return res.json({
      success: true,
      source: 'gemini',
      insights: parsed,
    });
  } catch (error: any) {
    console.error('Gemini potty insights error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate potty training insights',
    });
  }
});

// Setup Vite development server or production static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
