# ArcSide™ — Professional Welding & Fabrication Platform

**ArcSide** is a mobile-first, AI-powered welding and fabrication reference platform built for professional welders and fabricators working in the field. It provides validated calculators, AI-powered analysis tools, weld logging, and project management in a smartphone-optimized interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL via Neon (serverless) with Drizzle ORM |
| AI Engine | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Auth | Replit Auth (OpenID Connect) |
| Routing | wouter (client-side) |
| State/Data | TanStack Query v5 |
| PDF Export | jsPDF |

---

## Architecture Overview

```
client/               React SPA (Vite)
  src/
    pages/            Route-level page components
      calculators/    Individual calculator pages
      tools/          AI tool pages
    components/       Shared UI components
    hooks/            useAuth, useUnits, useTheme
    lib/              queryClient, authUtils, pdf-export
server/
  index.ts            Express app entry point
  routes.ts           All API endpoints
  calculators.ts      Pure math classes (WeldingCalculators, FabricationCalculators)
  ai-service.ts       GeminiAIService — all AI calls
  storage.ts          IStorage interface + DatabaseStorage (Drizzle/Neon)
  db.ts               Drizzle connection
  replitAuth.ts       Auth middleware
shared/
  schema.ts           Drizzle schema, Zod insert schemas, TypeScript types
```

The server serves the Vite-built frontend in production via `server/vite.ts`.
All routes are under `/api/`. Frontend uses relative URLs (`/api/...`) which work
seamlessly in both development and production via the Vite proxy.

---

## Gemini 2.0 Flash Integration

### Configuration
The AI service is located in `server/ai-service.ts`. It uses the `@google/generative-ai` SDK:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

The `GEMINI_API_KEY` environment variable must be set. On Replit, this is stored as a Secret.

### AI Tools Powered by Gemini

| Tool | Route | Gemini Method |
|---|---|---|
| Defect Analyzer | `POST /api/ai/analyze-defect` | `analyzeDefect(imageData, description)` |
| WPS Generator | `POST /api/ai/generate-wps` | `generateWPS(params)` |
| Material Checker | `POST /api/ai/check-material` | `checkMaterialCompatibility(params)` |
| Weld Assistant | `POST /api/ai/weld-assistant` | `getWeldingAdvice(question, context)` |
| Terminology | `POST /api/ai/terminology` | `getTerminologyExplanation(term)` |

### Rate Limits
Gemini 2.0 Flash has the following free-tier limits (as of March 2026):
- 15 requests per minute (RPM)
- 1,000,000 tokens per minute (TPM)
- 1,500 requests per day (RPD)

For production use beyond free tier, enable billing at [Google AI Studio](https://aistudio.google.com/apikey).

---

## Welding Calculator Math Reference

All calculators live in `server/calculators.ts`. The math follows these standards:

### Heat Input — `WeldingCalculators.calculateHeatInput()`
**Standard**: AWS D1.1 Section 4

```
HI (kJ/in) = (V × A × 60 × η) / (S × 1000)
```
Where:
- `V` = Arc Voltage (volts)
- `A` = Welding Current (amps)
- `η` = Process Efficiency factor (0.0–1.0)
- `S` = Travel Speed (in/min)
- `60` = converts seconds to minutes
- `1000` = converts joules to kilojoules

**Process Efficiency Defaults (η)**:
| Process | η |
|---|---|
| SAW | 1.00 |
| GMAW | 0.80 |
| FCAW | 0.80 |
| SMAW | 0.80 |
| GTAW | 0.60 |

**Heat Input Classification (kJ/in)**:
| Classification | Range |
|---|---|
| Low | < 25 kJ/in |
| Medium | 25–65 kJ/in |
| High | > 65 kJ/in |

### Voltage & Amperage — `WeldingCalculators.calculateVoltageAmperage()`
**Standard**: Lincoln Electric Welding Reference + AWS D1.1 empirical guidance

Empirical thickness-to-amperage mapping:
- ≤ 0.125": `A = 80 + (t × 400)`, `V = 16 + (t × 20)`
- ≤ 0.500": `A = 130 + (t × 200)`, `V = 18 + (t × 16)`
- > 0.500": `A = 180 + (t × 120)`, `V = 20 + (t × 12)`

Position derating: Overhead ×0.85, Vertical ×0.90.

### Wire Feed Speed — `WeldingCalculators.calculateWireFeedSpeed()`
Burn-rate approximation based on wire cross-sectional area:
```
WFS (IPM) = (A / (wireArea × 1000)) × materialFactor
```
Material factors: Aluminum 1.3×, Stainless 0.9×, Steel 1.0×.

### Preheat Temperature — `WeldingCalculators.calculatePreheatTemperature()`
**Standard**: AWS D1.1 Annex I (Carbon Equivalent method)

```
CE = %C + %Mn/6 + (%Cr + %Mo + %V)/5 + (%Ni + %Cu)/15
```
Minimum preheat lookup by CE tier, adjusted for thickness and heat input.

### Filler Consumption — `WeldingCalculators.calculateFillerConsumption()`
```
depositedWeight = area × weldLength × passes × density(0.284 lb/in³)
fillerRequired = depositedWeight / depositionEfficiency
```
Deposition efficiencies: GTAW 98%, SAW 99%, GMAW 93%, FCAW 86%, SMAW 68%.

### Gas Flow Rate — `WeldingCalculators.calculateGasFlowRate()`
Base flow from process/material table, adjusted for position and environment.
Gas type logic: GTAW → 100% Ar; GMAW aluminum → 100% Ar; GMAW stainless → 98% Ar/2% CO₂;
GMAW mild steel → 75% Ar/25% CO₂.

### Bend Allowance — `FabricationCalculators.calculateBendAllowance()`
**Standard**: ASME Y14.5 / Machinery's Handbook

```
BA = (π/180) × bendAngle × (insideRadius + k × thickness)
Setback = (insideRadius + thickness) × tan(bendAngle / 2)
```
Default K-factor: 0.33 (soft steel, air bend).

### Metal Weight — `FabricationCalculators.calculateMetalWeight()`
Volume × density (lb/in³). Material densities used:
Steel 0.284, Aluminum 0.098, Stainless 0.290, Copper 0.324, Brass 0.307.

---

## API Reference

### Auth
- `GET /api/auth/user` — current authenticated user
- `GET /api/login` — initiate OAuth login
- `GET /api/logout` — logout

### Calculators
All require authentication. Accept and return JSON.

| Method | Endpoint | Calculator |
|---|---|---|
| POST | `/api/calculators/voltage-amperage` | Voltage & Amperage |
| POST | `/api/calculators/wire-feed-speed` | Wire Feed Speed |
| POST | `/api/calculators/heat-input` | Heat Input |
| POST | `/api/calculators/gas-flow` | Gas Flow Rate |
| POST | `/api/calculators/preheat-temp` | Preheat Temperature |
| POST | `/api/calculators/filler-consumption` | Filler Consumption |
| POST | `/api/calculators/metal-weight` | Metal Weight |
| POST | `/api/calculators/bend-allowance` | Bend Allowance |
| POST | `/api/calculators/project-cost` | Project Cost |
| POST | `/api/calculators/weld-time` | Weld Time |
| POST | `/api/calculators/cutting-length` | Cut List Optimizer |
| GET | `/api/calculators/history` | Calculation history |

### AI Tools
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/analyze-defect` | Analyze weld defect image |
| POST | `/api/ai/generate-wps` | Generate WPS draft (Premium) |
| POST | `/api/ai/check-material` | Check material compatibility |
| POST | `/api/ai/weld-assistant` | Ask welding question |
| POST | `/api/ai/terminology` | Look up welding term |

### Projects & Logs
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/projects` | User projects |
| GET/POST | `/api/weld-log` | Weld log entries |
| DELETE | `/api/weld-log/:id` | Delete log entry |
| GET | `/api/usage` | Today's usage tracking |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (auto-set by Replit DB) |
| `SESSION_SECRET` | Yes | Express session secret (auto-set by Replit) |
| `REPL_ID` | Auto | Set by Replit runtime |
| `ISSUER_URL` | Auto | Set by Replit Auth |

---

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `users` | User profiles, subscription tier, preferences |
| `projects` | Welding projects (name, process, material, status) |
| `analyses` | AI analysis history (defect, WPS, material, etc.) |
| `calculations` | Calculator history with inputs and results |
| `weld_log_entries` | Weld log entries per project |
| `usage_tracking` | Daily AI usage counters per user |
| `wps_documents` | Generated WPS drafts |

---

## Running Locally

```bash
npm install
npm run dev   # starts Express + Vite dev server on port 5000
```

The app is available at `http://localhost:5000` or via the Replit preview pane.

---

## Subscription Tiers

| Feature | Free | Premium |
|---|---|---|
| Basic calculators | ✅ | ✅ |
| Weld Assistant | ✅ | ✅ |
| Defect Analyzer | ✅ (5/day) | ✅ Unlimited |
| Material Checker | ✅ | ✅ |
| Terminology | ✅ | ✅ |
| WPS Generator | ❌ | ✅ |
| Preheat & Interpass | ❌ | ✅ |
| Project Cost / Weld Time | ❌ | ✅ |
| Cutting Length Optimizer | ❌ | ✅ |
| Calculation history | Limited | Unlimited |

---

## License & Disclaimer

ArcSide is a field reference tool. All calculator outputs are estimates based on
industry empirical data and should be verified by a qualified welding engineer before
use in code-critical applications. See `/disclaimer` in the app for the full legal notice.
