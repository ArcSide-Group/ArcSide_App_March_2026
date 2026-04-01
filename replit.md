# ArcSide™️ Mobile App — Built by Tradesmen, For Tradesmen

## Overview

ArcSide™️ is a mobile-first web application for welding professionals. It provides AI-powered tools including defect analysis, WPS generation, material checking, terminology lookup, and an AI welding assistant. Currently in **closed beta** with invite-only access enforced via a code-level email whitelist. All measurements are metric (South African market), all costs in ZAR (R).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Mobile-First Design**: Responsive design optimized for mobile devices with a container-based layout
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Component Structure**: Modular component architecture with separate UI, layout, and feature components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with consistent error handling
- **File Structure**: Separation of concerns with dedicated files for routes, storage, authentication, and database operations
- **AI Service**: Mock AI service layer designed for future integration with actual AI APIs
- **Error Handling**: Centralized error handling middleware with structured error responses

### Database and Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple
- **Data Models**: 
  - Users with subscription tiers and status tracking
  - Projects for organizing welding work
  - Analysis results for defect analysis
  - WPS documents for welding procedures
  - Usage tracking for subscription limits

### Authentication and Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Authorization**: Route-level authentication middleware
- **User Management**: Complete user lifecycle with profile management and subscription handling

### Development and Build
- **Development Server**: Vite dev server with HMR and Express API proxy
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Environment**: Development and production environment configurations
- **Hot Reload**: Vite HMR for frontend, tsx for backend development

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect

### Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Font Sources**: Google Fonts integration for typography

### Development Tools
- **Vite**: Fast build tool with development server and HMR
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration and error overlay

### AI and Data Processing (Live Integration)
- **AI Provider**: Google Gemini 2.5 Flash via `@google/generative-ai` SDK
- **AI Service**: `server/ai-service.ts` — GeminiAIService class with 5 methods
- **AI Resilience**: `retryWithBackoff()` 3 attempts + `Promise.race()` 100s timeout per attempt
- **Vision Support**: Gemini Vision for image-based weld defect analysis (base64 inline)
- **Conversation Context**: Weld Assistant passes full conversation history to Gemini
- **Data Validation**: Zod schemas for type-safe data validation
- **API Key**: Stored as `GEMINI_API_KEY` secret

## Localisation: South African Market (Beta)
- **Units**: METRIC-ONLY enforced — mm, kg, °C, L/min, kJ/mm throughout
- **Currency**: ZAR (R) exclusively — no Stripe integration
- **Standards**: ISO 15614-1 / AWS D1.1 Metric; ISO 13916 heat input
- **`useUnits.ts`**: Locked to metric permanently — `toImperial`/`fromImperial` are identity functions; no unit-toggle UI exposed
- **`server/calculators.ts`**: All formulas metric-native (no imperial conversion needed)
  - `calculateVoltageAmperage`: thickness thresholds in mm, ~40A/mm base rule
  - `calculateWireFeedSpeed`: wireSize input in mm, output in mm/min
  - `calculateHeatInput`: `kJ/mm = (V × A × 60 × η) / (S_mm/min × 1000)` per ISO 13916
  - `calculateGasFlowRate`: output in L/min (was CFH)
  - `calculatePreheatTemperature`: °C only, thickness thresholds in mm, returns preheatC + maxInterpassC
  - `calculateFillerConsumption`: density kg/mm³, output kg; electrode = 3.2 mm 7018
  - `calculateWeldTime`: Banknote icon; cost displayed as `R{cost}`
  - `calculateCuttingLength`/`calculateMetalWeight`/`calculateBendAllowance`: all mm/kg
- **Wire size dropdowns**: 0.6/0.8/0.9/1.0/1.2/1.4/1.6 mm in voltage-amperage and wire-feed-speed pages
- **Heat input default**: 0.65 kJ/mm (was 60 kJ/in)
- **Preheat page**: Removed imperial fields; sends kJ/mm directly; displays °C only

## Stability & Error Handling
- **ErrorBoundary**: `[CRASH LOG]` prefix; "Try Again" + "Back to Dashboard" buttons
- **Server timeouts**: 120s via middleware for long-running AI requests
- **Process handlers**: `uncaughtException` / `unhandledRejection` with timestamps
- **Memory**: Image data cleared client-side post-analysis; `req.body` cleared after AI routes
- **Keep-alive**: `useKeepAlive.ts` pings every 30s to prevent Replit sleep

### Subscription and Usage Tracking
- **Built-in Subscription System**: Custom subscription management with tier-based limits
- **Usage Monitoring**: Real-time tracking of tool usage against subscription limits
- **Upgrade Flows**: Integrated subscription upgrade functionality