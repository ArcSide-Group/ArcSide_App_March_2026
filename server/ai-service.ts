import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ─── Imperial Unit Detector ───────────────────────────────────────────────────
// Scans a stringified AI response for imperial unit patterns.
// If found, throws so retryWithBackoff triggers another attempt.
const IMPERIAL_PATTERNS = [
  /\b\d+\.?\d*\s*(?:inch(?:es)?|in\.)\b/i,   // 3 inches / 0.5 in.
  /\b\d+\.?\d*\s*(?:foot|feet|ft\.?)\b/i,    // 12 feet / 6 ft
  /\b\d+\.?\d*\s*(?:lbs?|pounds?)\b/i,       // 10 lbs / 5 pounds
  /°F\b/,                                      // °F
  /\bFahrenheit\b/i,                           // Fahrenheit
  /\b\d+\.?\d*\s*psi\b/i,                     // 75 psi
  /\b\d+\.?\d*\s*mph\b/i,                     // travel speed in mph
];

function assertMetricOnly(text: string, endpoint: string): void {
  for (const pattern of IMPERIAL_PATTERNS) {
    if (pattern.test(text)) {
      console.warn(`[AI][${endpoint}] Imperial unit detected (${pattern}), forcing retry`);
      const err: any = new Error(`Imperial unit detected in AI response — retrying with strict metric enforcement`);
      err.status = 500; // mark as retryable
      throw err;
    }
  }
}

// ─── Retry Utility ────────────────────────────────────────────────────────────
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 2000,
  timeoutMs: number = 100000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt}/${maxAttempts}`);

      const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      return await Promise.race([fn(), timeoutPromise]);
    } catch (error) {
      lastError = error as Error;
      const errorStatus = (error as any)?.status || 500;
      const isTimeout = (error as Error).message?.includes('timeout');

      const isRetryable = (errorStatus >= 500 || errorStatus === 429) && !isTimeout;

      if (isRetryable && attempt < maxAttempts) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[AI] Attempt ${attempt} failed (status ${errorStatus}), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        break;
      }
    }
  }

  throw lastError || new Error('AI service failed after all retry attempts');
}

// ─── Global System Context ────────────────────────────────────────────────────
const SYSTEM_CONTEXT = `You are ArcSide, an expert AI assistant for professional welders and fabricators in South Africa.
You have deep knowledge of:
- All welding processes (GMAW, SMAW, GTAW, FCAW, SAW, etc.)
- ISO 15614-1 and AWS Metric welding standards (as used in South Africa)
- Weld defect identification and remediation
- Welding Procedure Specifications (WPS) for South African industry
- Material metallurgy and compatibility
- Welding safety and best practices

CRITICAL RULES FOR SOUTH AFRICA:
1. UNITS: ALWAYS use Metric units ONLY. Use mm for thickness/length, kg for weight, m for distances, °C for temperature. NEVER use inches, feet, pounds, or Fahrenheit.
2. CURRENCY: ALL costs MUST be in South African Rands (R). NEVER use USD, Dollars, or any other currency. Format as R X.XX
3. STANDARDS: Reference ISO 15614-1 or AWS Metric standards, NOT U.S. Customary versions.
4. MARKET CONTEXT: Use South African market averages for rates (e.g., R 550/hour for welders, R 250/unit for materials).
5. All calculations, recommendations, and specifications MUST comply with South African industry norms and standards.

Always provide accurate, practical, professional-grade advice tailored to South African welders and fabricators.`;

// Appended to every prompt that involves measurable quantities
const METRIC_LOCK = `
⚠ STRICTLY METRIC OUTPUT REQUIRED ⚠
Every single measurement in your response MUST be in Metric units:
  • Length / thickness / diameter → mm
  • Weight / mass               → kg
  • Temperature                 → °C
  • Flow rate                   → L/min
  • Speed                       → mm/min or m/min
  • Heat input                  → kJ/mm
  • Cost                        → R (South African Rands)
DO NOT use inches, feet, lbs, pounds, Fahrenheit, psi, or any other Imperial unit anywhere in your response.
If you are tempted to write an Imperial value, convert it to Metric first.`;

// ─── AI Service ───────────────────────────────────────────────────────────────
export class GeminiAIService {

  // ── Defect Analyzer ──────────────────────────────────────────────────────────
  static async analyzeDefect(
    imageData: string | null,
    additionalDetails: string,
    unitPreference: 'metric' | 'imperial' = 'metric'
  ): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const basePrompt = `${SYSTEM_CONTEXT}
${METRIC_LOCK}

DEFECT ANALYSIS (Strictly Metric: mm, kg, °C — no imperial units)
${additionalDetails ? `Additional context from the welder: ${additionalDetails}` : ''}

Analyze this weld and provide a detailed response in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "defectType": "name of the primary defect detected",
  "severity": "low|medium|high|critical",
  "causes": ["cause1", "cause2", "cause3"],
  "solutions": ["solution1", "solution2", "solution3"],
  "description": "detailed description of what you observe and why it occurred — all measurements in mm and °C",
  "standards": "relevant ISO 15614-1 or AWS Metric standard acceptance criteria",
  "preventionTips": ["tip1", "tip2"]
}`;

      let result;

      if (imageData) {
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        const mimeTypeMatch = imageData.match(/data:([^;]+);/);
        const mimeType = (mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg") as any;

        const imagePart: Part = {
          inlineData: { data: base64Data, mimeType }
        };

        result = await model.generateContent([basePrompt, imagePart]);
      } else {
        const textOnlyPrompt = `${SYSTEM_CONTEXT}
${METRIC_LOCK}

DEFECT ANALYSIS — TEXT DESCRIPTION (Strictly Metric: mm, kg, °C)
A welder describes the following defect: "${additionalDetails}"

Analyze this description and provide a detailed response in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "defectType": "name of the primary defect detected",
  "severity": "low|medium|high|critical",
  "causes": ["cause1", "cause2", "cause3"],
  "solutions": ["solution1", "solution2", "solution3"],
  "description": "detailed description of what likely occurred — all measurements in mm and °C",
  "standards": "relevant ISO 15614-1 or AWS Metric standard acceptance criteria",
  "preventionTips": ["tip1", "tip2"]
}`;
        result = await model.generateContent(textOnlyPrompt);
      }

      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Double-lock: reject and retry if imperial units appear in the response
      assertMetricOnly(cleaned, 'analyzeDefect');

      return JSON.parse(cleaned);
    });
  }

  // ── WPS Generator ────────────────────────────────────────────────────────────
  static async generateWPS(params: any): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}
${METRIC_LOCK}

WPS GENERATION (Strictly Metric: mm, kg, °C, mm/min, kJ/mm — no imperial units)

Generate a professional Welding Procedure Specification (WPS) for the following parameters (South African context):
- Project: ${params.projectName || "General Welding Project"}
- Base Material: ${params.baseMaterial}
- Material Thickness: ${params.thickness} mm (METRIC — do NOT convert to inches)
- Joint Type: ${params.jointType}
- Welding Process: ${params.process}
- Standard: ${params.standard} (ISO 15614-1 or AWS Metric)

All preheat/interpass temperatures MUST be in °C.
All dimensions (wire diameter, root gap, cap width) MUST be in mm.
All travel speeds MUST be in mm/min.
All heat input values MUST be in kJ/mm.
All costs MUST be in Rands (R).

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
  "preheatTemp": "preheat temperature in °C (e.g. 150°C)",
  "interpassTemp": "maximum interpass temperature in °C (e.g. 250°C)",
  "postWeldHeatTreatment": "PWHT requirements if any",
  "shieldingGas": "shielding gas composition and flow rate in L/min",
  "parameters": {
    "voltage": "voltage range in V",
    "amperage": "amperage range in A",
    "wireSize": "filler wire diameter in mm (e.g. 1.2 mm)",
    "current": "current type and polarity",
    "travelSpeed": "travel speed range in mm/min",
    "heatInput": "heat input range in kJ/mm"
  },
  "qualityRequirements": "applicable ISO 15614-1 inspection and testing requirements",
  "safetyNotes": ["safety note 1", "safety note 2"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Double-lock: reject and retry if imperial units appear
      assertMetricOnly(cleaned, 'generateWPS');

      return JSON.parse(cleaned);
    });
  }

  // ── Material Compatibility ───────────────────────────────────────────────────
  static async checkMaterialCompatibility(material1: string, material2: string): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}

Analyze the welding compatibility between these two materials:
- Material 1: ${material1}
- Material 2: ${material2}

All temperatures must be in °C. All dimensions in mm. All costs in Rands (R).

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
  "preheatTemp": "preheat temperature in °C if required",
  "notes": "any additional important notes"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    });
  }

  // ── Terminology ──────────────────────────────────────────────────────────────
  static async searchTerminology(term: string): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}

Define and explain the welding/fabrication term: "${term}"
All measurements in mm and °C. Reference ISO 15614-1 or AWS Metric standards.

Provide a comprehensive definition in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "term": "${term}",
  "definition": "clear, detailed definition suitable for professional welders",
  "types": ["type or variant 1", "type or variant 2"],
  "causes": ["cause 1 if applicable", "cause 2 if applicable"],
  "relatedTerms": ["related term 1", "related term 2", "related term 3"],
  "standard": "relevant ISO 15614-1 or AWS Metric standard reference if applicable",
  "example": "practical example of how this applies in the field (measurements in mm and °C)",
  "tips": ["practical tip 1", "practical tip 2"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    });
  }

  // ── Weld Assistant (Chat) ────────────────────────────────────────────────────
  static async askAssistant(
    question: string,
    conversationHistory?: Array<{ role: string; content: string }>,
    unitPreference: 'metric' | 'imperial' = 'metric'
  ): Promise<string> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let fullPrompt = `${SYSTEM_CONTEXT}
${METRIC_LOCK}

You are a friendly, expert welding assistant for South African professionals.
Give practical, accurate answers. Use bullet points and clear formatting where helpful.
Keep responses focused and professional but conversational.
Remember: ALL measurements in mm/kg/°C, ALL costs in Rands (R).

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

  // ── Process Optimizer ────────────────────────────────────────────────────────
  static async optimizeProcess(params: any): Promise<any> {
    return retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `${SYSTEM_CONTEXT}
${METRIC_LOCK}

PROCESS OPTIMIZATION (Strictly Metric: mm, kg, °C, mm/min, kJ/mm — no imperial units)

You are helping a South African welder optimize their welding process parameters.

Current Setup:
- Welding Process: ${params.process}
- Base Material: ${params.material}
- Thickness: ${params.thickness} mm (METRIC — treat as millimetres, NOT inches)
- Joint Type: ${params.jointType}
- Current Parameters: ${params.currentParams || "Not specified"}
- Optimization Goal: ${params.goal}

Provide detailed AI recommendations to optimize this welding process.
Include parameter adjustments (in mm, °C, mm/min, kJ/mm, A, V), best practices,
expected improvements, and any warnings or considerations.
All costs must be in Rands (R). Do NOT use any imperial units.

Respond ONLY with valid JSON in this format (no markdown):
{
  "result": "detailed optimization recommendations as a formatted string with sections: Overview, Recommended Parameters (Metric), Expected Improvements, Implementation Steps, Safety Considerations, Quality Tips"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Double-lock: reject and retry if imperial units appear
      assertMetricOnly(cleaned, 'optimizeProcess');

      const parsed = JSON.parse(cleaned);
      return parsed.result || parsed;
    });
  }
}
