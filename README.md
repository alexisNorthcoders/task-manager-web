# Task Manager Web Client

A mobile-first Svelte web client for the Task Manager GraphQL API.

## Features

- 🚀 **SvelteKit** for fast, modern web development
- 📱 **Mobile-first** responsive design with TailwindCSS
- 🔐 **JWT Authentication** with secure token management
- 📊 **GraphQL Integration** with graphql-request
- 💾 **Progressive Web App** (PWA) capabilities
- ⚡ **Optimized for Speed** with Vite build system

## Quick Start

### Prerequisites

- Node.js 18+ 
- Task Manager server running on `http://localhost:8080`

### Installation

```bash
# Clone and install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking

## Project Structure

```
src/
├── lib/
│   ├── api/          # GraphQL client and API calls
│   ├── stores/       # Svelte stores for state management
│   └── types/        # TypeScript type definitions
├── routes/
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Dashboard page
│   └── tasks/        # Task management pages
├── app.css           # Global styles with TailwindCSS
└── app.html          # HTML template
```

## Development

The app is designed to work with the Task Manager GraphQL API. Make sure the server is running before starting development.

### Environment Variables

- `PUBLIC_API_URL` - URL of the Task Manager API (default: http://localhost:8080)

### Authentication

The app uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Automatically included in GraphQL requests
- Protected routes redirect to login when not authenticated

### PWA Features

The app includes Progressive Web App capabilities:
- Service worker for offline functionality
- App manifest for installation
- Optimized caching strategies

## Building for Production

```bash
npm run build
```

The built application will be in the `build/` directory, ready for deployment to any static hosting service.

## Deployment

The app can be deployed to:
- Vercel (recommended)
- Netlify
- Any static hosting service

Make sure to set the `PUBLIC_API_URL` environment variable to point to your production API.