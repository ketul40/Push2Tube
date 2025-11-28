# Push2Tube

AI-powered video generation platform that transforms text prompts into YouTube videos.

## Project Structure

```
Push2Tube/
├── src/
│   ├── components/     # React components
│   ├── services/       # Firebase and API services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── config/         # Configuration files
│   ├── test/           # Test setup and utilities
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── .env.example        # Environment variable template
└── package.json        # Project dependencies
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

3. Run development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library + fast-check
- **APIs**: Sora (video generation), OpenAI (metadata), YouTube Data API

## Development

This project uses:
- TypeScript for type safety
- Vitest for unit and property-based testing
- Firebase for backend services
- React Router for navigation

## License

Private
