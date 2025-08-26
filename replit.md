# ArcSide™ - Professional Welding Tools

## Overview

ArcSide™ is a mobile-first web application designed as "The App Made by Tradesmen for Tradesmen." It provides AI-powered tools for welding professionals, including defect analysis, WPS (Welding Procedure Specification) generation, material checking, terminology lookup, and an AI welding assistant. The application features a freemium subscription model with usage limits for free users and unlimited access for premium subscribers.

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

### AI and Data Processing (Mock Implementation)
- **Future AI Integration**: Architecture prepared for AI service integration
- **Mock Services**: Simulated AI responses for defect analysis and WPS generation
- **Data Validation**: Zod schemas for type-safe data validation

### Subscription and Usage Tracking
- **Built-in Subscription System**: Custom subscription management with tier-based limits
- **Usage Monitoring**: Real-time tracking of tool usage against subscription limits
- **Upgrade Flows**: Integrated subscription upgrade functionality