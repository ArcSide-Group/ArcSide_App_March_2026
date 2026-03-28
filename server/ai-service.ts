import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt}/${maxAttempts}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const errorStatus = (error as any)?.status || 500;
      
      // Check if error is retryable (5xx errors, rate limiting)
      const isRetryable = errorStatus >= 500 || errorStatus === 429;
      
      if (isRetryable && attempt < maxAttempts) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[AI] Attempt ${attempt} failed (status ${errorStatus}), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else if (!isRetryable || attempt === maxAttempts) {
        break;
      }
    }
  }
  
  throw lastError || new Error('AI service failed after all retry attempts');
}

const SYSTEM_CONTEXT = `You are ArcSide, an expert AI assistant for professional welders and fabricators. 
You have deep knowledge of:
- All welding processes (GMAW, SMAW, GTAW, FCAW, SAW, etc.)
- AWS, ASME, ISO welding standards and codes
- Weld defect identification and remediation
- Welding Procedure Specifications (WPS)
- Material metallurgy and compatibility
- Welding safety and best practices
Always provide accurate, practical, professional-grade advice.
IMPORTANT: Always provide measurements in the user's preferred units. If Metric is selected, use mm for thickness/length and Celsius for temperature. If Imperial is selected, use inches and Fahrenheit.`;

export class GeminiAIService {
  static async analyzeDefect(imageData: string | null, additionalDetails: string, unitPreference: 'metric' | 'imperial' = 'metric'): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const unitNote = unitPreference === 'metric' 
        ? 'UNIT PREFERENCE: User prefers Metric units (mm, kg, °C). Please provide all measurements in these units.'
        : 'UNIT PREFERENCE: User prefers Imperial units (inches, lbs, °F). Please provide all measurements in these units.';
      
      let prompt = `${SYSTEM_CONTEXT}

${unitNote}

You are analyzing a weld defect. ${additionalDetails ? `Additional context from the welder: ${additionalDetails}` : ""}

Analyze this weld and provide a detailed response in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "defectType": "name of the primary defect detected",
  "severity": "low|medium|high|critical",
  "causes": ["cause1", "cause2", "cause3"],
  "solutions": ["solution1", "solution2", "solution3"],
  "description": "detailed description of what you observe and why it occurred",
  "standards": "relevant AWS/ASME standard acceptance criteria",
  "preventionTips": ["tip1", "tip2"]
}`;

      let result;

      if (imageData) {
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        const mimeTypeMatch = imageData.match(/data:([^;]+);/);
        const mimeType = (mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg") as any;

        const imagePart: Part = {
          inlineData: {
            data: base64Data,
            mimeType
          }
        };

        result = await model.generateContent([prompt, imagePart]);
      } else {
        prompt = `${SYSTEM_CONTEXT}

A welder describes the following defect: "${additionalDetails}"

Analyze this description and provide a detailed response in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "defectType": "name of the primary defect detected",
  "severity": "low|medium|high|critical",
  "causes": ["cause1", "cause2", "cause3"],
  "solutions": ["solution1", "solution2", "solution3"],
  "description": "detailed description of what likely occurred and why",
  "standards": "relevant AWS/ASME standard acceptance criteria",
  "preventionTips": ["tip1", "tip2"]
}`;
        result = await model.generateContent(prompt);
      }

      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    });
  }

  static async generateWPS(params: any): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}

Generate a professional Welding Procedure Specification (WPS) for the following parameters:
- Project: ${params.projectName || "General Welding Project"}
- Base Material: ${params.baseMaterial}
- Material Thickness: ${params.thickness} inches
- Joint Type: ${params.jointType}
- Welding Process: ${params.process}
- Standard: ${params.standard}

Provide a complete WPS in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "wpsNumber": "WPS-XXXXX (generate a realistic number)",
  "title": "descriptive title for this WPS",
  "baseMaterial": "${params.baseMaterial}",
  "fillerMetal": "recommended filler metal classification",
  "process": "${params.process}",
  "standard": "${params.standard}",
  "jointDesign": "description of joint design",
  "baseMetalPrep": "base metal preparation requirements",
  "preheatTemp": "preheat temperature requirement",
  "interpassTemp": "maximum interpass temperature",
  "postWeldHeatTreatment": "PWHT requirements if any",
  "shieldingGas": "shielding gas composition and flow rate",
  "parameters": {
    "voltage": "voltage range",
    "amperage": "amperage range",
    "wireSize": "filler wire diameter",
    "current": "current type and polarity",
    "travelSpeed": "travel speed range",
    "heatInput": "heat input range"
  },
  "qualityRequirements": "applicable inspection and testing requirements",
  "safetyNotes": ["safety note 1", "safety note 2"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    });
  }

  static async checkMaterialCompatibility(material1: string, material2: string): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}

Analyze the welding compatibility between these two materials:
- Material 1: ${material1}
- Material 2: ${material2}

Provide a thorough compatibility analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "status": "compatible|caution|incompatible",
  "compatibility": "one sentence summary of compatibility",
  "recommendations": [
    {"title": "recommendation title", "description": "detailed recommendation"},
    {"title": "recommendation title", "description": "detailed recommendation"},
    {"title": "recommendation title", "description": "detailed recommendation"}
  ],
  "issues": ["potential issue 1", "potential issue 2"],
  "suggestedProcess": "recommended welding process",
  "fillerMetal": "recommended filler metal",
  "preheatRequired": true or false,
  "preheatTemp": "preheat temperature if required",
  "notes": "any additional important notes"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    });
  }

  static async searchTerminology(term: string): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}

Define and explain the welding/fabrication term: "${term}"

Provide a comprehensive definition in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "term": "${term}",
  "definition": "clear, detailed definition suitable for professional welders",
  "types": ["type or variant 1", "type or variant 2"],
  "causes": ["cause 1 if applicable", "cause 2 if applicable"],
  "relatedTerms": ["related term 1", "related term 2", "related term 3"],
  "standard": "relevant AWS/ASME standard reference if applicable",
  "example": "practical example of how this applies in the field",
  "tips": ["practical tip 1", "practical tip 2"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    });
  }

  static async askAssistant(question: string, conversationHistory?: Array<{role: string, content: string}>, unitPreference: 'metric' | 'imperial' = 'metric'): Promise<string> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const unitNote = unitPreference === 'metric' 
        ? 'UNIT PREFERENCE: User prefers Metric units (mm, kg, °C). Please provide all measurements in these units.'
        : 'UNIT PREFERENCE: User prefers Imperial units (inches, lbs, °F). Please provide all measurements in these units.';

      let fullPrompt = `${SYSTEM_CONTEXT}

${unitNote}

You are a friendly, expert welding assistant. Give practical, accurate answers. Use bullet points and clear formatting where helpful. Keep responses focused and professional but conversational.

`;

      if (conversationHistory && conversationHistory.length > 0) {
        fullPrompt += "Previous conversation:\n";
        conversationHistory.slice(-6).forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'Welder' : 'ArcSide'}: ${msg.content}\n`;
        });
        fullPrompt += "\n";
      }

      fullPrompt += `Welder's question: ${question}\n\nArcSide:`;

      const result = await model.generateContent(fullPrompt);
      return result.response.text().trim();
    });
  }

  static async optimizeProcess(params: any): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}

You are helping a welder optimize their welding process parameters.

Current Setup:
- Welding Process: ${params.process}
- Base Material: ${params.material}
- Thickness: ${params.thickness}"
- Joint Type: ${params.jointType}
- Current Parameters: ${params.currentParams || "Not specified"}
- Optimization Goal: ${params.goal}

Provide detailed AI recommendations to optimize this welding process. Include parameter adjustments, best practices, expected improvements, and any warnings or considerations.

Respond ONLY with valid JSON in this format (no markdown):
{
  "result": "detailed optimization recommendations as a formatted string with sections like: Overview, Recommended Parameters, Expected Improvements, Implementation Steps, Safety Considerations, Quality Tips"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.result || parsed;
    });
  }
}
