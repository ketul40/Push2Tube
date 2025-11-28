# Push2Tube Cloud Functions

This directory contains the Firebase Cloud Functions for the Push2Tube platform.

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

3. Build the functions:
```bash
npm run build
```

## Development

### Local Testing
Run functions locally with Firebase emulators:
```bash
npm run serve
```

### Testing
Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Deployment

Deploy all functions:
```bash
npm run deploy
```

Deploy specific function:
```bash
firebase deploy --only functions:functionName
```

## Project Structure

```
functions/
├── src/
│   ├── index.ts           # Main entry point, exports all functions
│   ├── config/            # Configuration and environment variables
│   ├── middleware/        # Authentication and request middleware
│   ├── services/          # Business logic (video, metadata, YouTube)
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper utilities
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

## Environment Variables

See `.env.example` for required environment variables.

## Functions

- `createVideoJob` - HTTP endpoint to create new video jobs
- `processVideoJob` - Firestore trigger to orchestrate video generation pipeline
- `generateVideo` - Helper to call Sora API
- `generateMetadata` - Helper to call OpenAI API
- `uploadToYouTube` - Helper to upload videos to YouTube
- `refreshYouTubeToken` - Helper to refresh OAuth tokens

## Security

- All HTTP functions verify Firebase ID tokens
- OAuth tokens are encrypted before storage
- API keys are stored in environment variables
- Firestore security rules enforce data isolation
