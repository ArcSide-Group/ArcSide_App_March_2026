# ArcSide™ User Guide

**Welcome to ArcSide** — your professional welding companion designed for the shop floor and the field.
This guide walks you through every feature so you can get the most out of the platform.

---

## Getting Started

### Logging In
ArcSide uses your **Replit account** for secure login. Tap **Log In** on the landing screen and authenticate.
Your session stays active so you won't need to log in repeatedly on the same device.

### Navigation
The **bottom navigation bar** gives you one-tap access to:
- **Home** (house icon) — dashboard, quick links, recent projects
- **Tools** (wrench icon) — AI-powered analysis tools
- **Calculators** (calculator icon) — welding & fabrication calculators
- **Projects** (folder icon) — your project list and weld logs
- **Settings** (gear icon) — units, theme, profile

---

## Unit System

ArcSide supports both **Imperial** and **Metric** unit systems.

Go to **Settings → Units** and toggle between:
- **Imperial**: inches, lbs, °F, in/min, kJ/in, CFH
- **Metric**: mm, kg, °C, mm/min, kJ/mm, L/min

All calculators automatically convert inputs and outputs when you switch units.
Your preference is saved locally on your device.

---

## Welding Calculators

Access all calculators from **Calculators** in the bottom nav or the Home screen.

### Heat Input Calculator
**What it does**: Calculates the energy delivered to the base metal per unit length of weld.

**Inputs**:
- Arc Voltage (V)
- Welding Current / Amperage (A)
- Travel Speed (in/min or mm/min)
- Process Efficiency (0.1–1.0, default 0.8)

**Formula used** (AWS D1.1):
> HI (kJ/in) = (V × A × 60 × η) / (S × 1000)

**Results**:
- Heat Input value in kJ/in (or kJ/mm in metric mode)
- Classification: Low / Medium / High
- Recommendations based on classification

**When to use**: Before welding high-CE steels, reviewing HAZ impact toughness requirements,
or establishing preheat/interpass temperature requirements.

**Typical ranges**:
| Classification | kJ/in | kJ/mm |
|---|---|---|
| Low | < 25 | < 1.0 |
| Medium | 25–65 | 1.0–2.5 |
| High | > 65 | > 2.5 |

---

### Voltage & Amperage Calculator
**What it does**: Provides a recommended starting voltage and amperage for your process, material, thickness, and position.

**Inputs**:
- Welding process (GMAW, SMAW, GTAW, FCAW)
- Base material (steel, stainless, aluminum)
- Material thickness
- Welding position (flat, horizontal, vertical, overhead)
- Wire size (for GMAW/FCAW)

**Results**:
- Recommended voltage and amperage
- Range (±2V, ±20A from recommended)
- Process-specific tips

**Important**: These are starting-point estimates. Always verify with a test bead on scrap material. Follow your WPS when one is available.

---

### Wire Feed Speed Calculator
**What it does**: Estimates the wire feed speed (WFS) in inches per minute (or mm/min) for MIG/GMAW welding based on amperage and wire diameter.

**Inputs**:
- Welding amperage (A)
- Wire diameter (0.023"–1/16")
- Material type (mild steel, stainless, aluminum)

**Typical WFS ranges**:
- 0.023" wire at 80–120A: 150–300 IPM
- 0.035" wire at 130–200A: 130–200 IPM
- 0.045" wire at 175–300A: 100–175 IPM

---

### Preheat & Interpass Temperature (Premium)
**What it does**: Calculates minimum preheat temperature based on the Carbon Equivalent (CE) of the steel, thickness, and welding process.

**Standard**: AWS D1.1 Annex I

**Supported materials**: A36, A572 Gr50, A514, 4130, 4140, 1018, 1020, 1045, A992, DOM tubing

**Outputs**:
- Minimum preheat temperature (°F and °C)
- Maximum interpass temperature
- Carbon Equivalent (CE) value
- Hydrogen cracking risk level
- Step-by-step preheat instructions

**Important**: Always verify preheat with temperature-indicating sticks or a contact thermocouple. Maintain preheat temperature for at least 3" on each side of the joint.

---

### Gas Flow Rate Calculator
**What it does**: Recommends shielding gas flow rate and gas type for your process and material.

**Gas type recommendations**:
| Process | Material | Recommended Gas |
|---|---|---|
| GTAW | Any | 100% Argon |
| GMAW | Mild Steel | 75% Ar / 25% CO₂ |
| GMAW | Stainless | 98% Ar / 2% CO₂ |
| GMAW | Aluminum | 100% Argon |
| FCAW | Steel | 75% Ar / 25% CO₂ (per wire spec) |

---

### Filler Consumption Calculator
**What it does**: Estimates how much filler metal (wire or electrodes) you'll need for a weld job.

**Joint types supported**: Fillet weld, V-groove butt weld, lap joint

**Inputs**: Joint type, weld length, leg size or plate thickness, groove angle, number of passes, welding process

**Outputs**: Deposited weld weight (lbs), filler metal required (accounting for deposition efficiency and loss), electrode count estimate for SMAW

**Tip**: Add 10% to your calculated amount when ordering to allow for restarts, stub loss, and quality testing.

---

### Metal Weight Calculator
**What it does**: Calculates the weight of a metal stock piece (plate, rod, or tube) given its dimensions.

**Materials supported**: Steel, Aluminum, Stainless Steel, Copper, Brass

**Shapes**: Plate/flat, Round rod, Round tube (hollow)

---

### Bend Allowance Calculator
**What it does**: Calculates the flat blank length to use when bending sheet metal, plus the setback distance.

**Formula**: Uses the standard K-factor method (ASME Y14.5)

**Default K-factor**: 0.33 (typical for air bending mild steel). Adjust based on your press brake and material.

---

### Project Cost Estimator (Premium)
Estimates total job cost including materials, labor, overhead (15%), and profit margin (20%). Provides a cost breakdown by percentage.

---

### Weld Time Estimator (Premium)
Calculates arc time, total operating time (accounting for arc efficiency), setup time, and estimated labor cost.

---

### Cut List Optimizer (Premium)
Uses a bin-packing algorithm (First Fit Decreasing) to optimize how many stock bars are required, minimize waste, and count cuts — accounting for kerf width.

---

## AI Tools

All AI tools are powered by **Google Gemini 2.0 Flash**. They require an active internet connection.

> **Important**: AI tools provide reference information only. Results must be reviewed by a qualified welding professional before any production application.

### Defect Analyzer
Upload a photo of a weld and get an AI-powered analysis identifying potential defects, severity, and recommended corrective actions.

**How to use**:
1. Tap **Defect Analyzer** from the Tools screen
2. Upload or capture a photo of the weld
3. Optionally add a description of the weld process and materials
4. Tap **Analyze**

**Defects the AI can identify**: Porosity, undercut, overlap, lack of fusion, cracks, spatter, burn-through, incomplete penetration, and more.

**Free tier limit**: 5 analyses per day. Upgrade to Premium for unlimited analyses.

### WPS Generator (Premium)
Generates a draft Welding Procedure Specification based on your process, material, joint type, and position. Output includes essential variables, preheat requirements, and gas specifications in standard WPS format.

**Disclaimer**: Generated WPS drafts are starting points only. They must be reviewed, modified as needed, and signed off by a qualified CWI or Welding Engineer. A PQR is required for code qualification.

### Material Compatibility Checker
Enter two materials to check welding compatibility — the AI provides recommended filler metals, potential issues, and tips for dissimilar metal welding.

### Weld Assistant
Ask any welding question in plain language and get expert-level guidance. Supports questions on:
- Process selection and parameter optimization
- Troubleshooting weld defects
- Code requirements and interpretation
- PWHT and preheat guidance
- Safety and PPE questions

**Tip**: Be specific. Instead of "why is my weld bad?", ask "I'm GMAW welding 3/8" A36 with 0.035" ER70S-6 at 180A and getting porosity along the length. Shielding gas is 75/25 at 25 CFH."

### Terminology Reference
Look up any welding or fabrication term for a clear, code-accurate definition with examples.

---

## Projects & Weld Log

### Creating a Project
1. Go to **Projects** → **New Project**
2. Enter project name, description, welding process, and material
3. Save — the project now appears in your dashboard

### Weld Log
Log individual welds within a project, recording:
- Joint type and location
- Process, electrode/wire, heat settings
- Pass number and position
- Inspector sign-off notes
- Date and welder ID

Access weld log from **Projects → [Project Name] → Weld Log** or directly from the **Weld Log** tab.

---

## Profile & Settings

### Theme
Switch between **Light** and **Dark** mode from Settings. Dark mode uses ArcSide's deep navy industrial palette.

### Units
Toggle between Imperial and Metric. All calculator defaults and labels update automatically.

### Subscription
Upgrade to **Premium** from Settings → Subscription. Premium unlocks:
- Preheat & Interpass Temperature calculator
- Project Cost Estimator
- Weld Time Estimator
- Cut List Optimizer
- Unlimited defect analysis
- WPS Generator

---

## Tips for On-Site Use

1. **Set your units before you start** — change once in Settings and all calculators remember your preference
2. **Save calculations to projects** — every calculation is logged to your history automatically
3. **Use Heat Input + Preheat together** — run heat input first, then use the result as input to the preheat calculator
4. **Take the photo before cleaning** — the Defect Analyzer works best on as-welded surfaces before wire brushing
5. **Trust your WPS** — app calculators are great for quick checks, but your approved WPS governs in code work
6. **Check the Liability Disclaimer** — Settings → About → Disclaimer. Know the limitations before trusting calculated values.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| AI tools return "failed" | Check internet connection; Gemini API may be rate-limited (free tier: 15 req/min) |
| Calculations seem off | Verify unit settings match your inputs; check that travel speed is in the right unit |
| App doesn't load | Hard refresh the browser; clear cache if needed |
| Login fails | Ensure you have a valid Replit account |

---

## Welding Standards Referenced

| Standard | Scope |
|---|---|
| AWS D1.1 | Structural Welding Code — Steel |
| AWS D1.2 | Structural Welding Code — Aluminum |
| ASME Section IX | Welding, Brazing & Fusing Qualifications |
| API 1104 | Welding of Pipelines and Related Facilities |
| AWS A2.4 | Standard Symbols for Welding |
| AWS A3.0 | Standard Welding Terms and Definitions |
| AWS A5.xx series | Filler Metal Specifications |
| ASME Y14.5 | Geometric Dimensioning and Tolerancing (sheet metal) |
| OSHA 29 CFR 1910.252 | Welding, Cutting and Brazing Safety Standards |

---

*ArcSide™ — Built for the shop floor, designed for the professional.*

*All calculations are reference estimates. Verify with a qualified Welding Engineer for code-critical applications.*
