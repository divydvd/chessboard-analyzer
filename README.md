
# ChessVision App

This application allows you to analyze chess positions from images using AI.

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file at the root of the project
4. Copy the contents from `.env.example` to your new `.env` file
5. Fill in your API keys:

```
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
```

6. Run the application with `npm run dev`

## AI Image Analysis

The app supports two AI providers:

1. OpenAI (GPT-4o) - Requires an API key from https://openai.com
2. DeepSeek Vision - Requires an API key from https://deepseek.com

Add at least one of these keys to your `.env` file to enable image analysis.
