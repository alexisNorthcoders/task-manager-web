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

The built application will be in the `build/` directory as a Node.js application with SSR capabilities.

## Deployment

This SvelteKit app uses the Node.js adapter and requires a Node.js runtime environment. It can be deployed to:

- **Railway** (recommended for Node.js apps)
- **Render**
- **Heroku**
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**
- **Google Cloud Run**
- **Any Node.js hosting service**

### Docker Deployment

The project includes a `Dockerfile` for containerized deployment:

```bash
# Build the Docker image
docker build -t task-manager-web .

# Run the container
docker run -p 3000:3000 -e PUBLIC_API_URL=http://your-api-url task-manager-web
```

### Environment Variables

Make sure to set the `PUBLIC_API_URL` environment variable to point to your production API:

```bash
PUBLIC_API_URL=https://your-api-domain.com
```

### Production Notes

- The app runs on port 3000 by default
- Ensure your hosting platform supports Node.js 18+
- The app includes SSR (Server-Side Rendering) capabilities