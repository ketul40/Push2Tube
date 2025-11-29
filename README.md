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

3. Set up Stripe (for payments):
```bash
# See STRIPE_SETUP.md for detailed instructions
# Copy functions/.env.example to functions/.env and add Stripe keys
cd functions
cp .env.example .env
# Edit .env with your Stripe configuration
```

4. (Optional) Enable test mode to bypass authentication:
```bash
# Add to .env.local:
VITE_TEST_MODE=true
```
**Note:** Test mode bypasses authentication for testing purposes. Set to `false` or remove to require authentication.

5. Run development server:
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
- **Payments**: Stripe (subscription management)

## Development

This project uses:
- TypeScript for type safety
- Vitest for unit and property-based testing
- Firebase for backend services
- React Router for navigation

## License

Private
