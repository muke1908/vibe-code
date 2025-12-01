# Nutrition Tracker

A minimalistic web application for tracking food intake with AI-powered nutritional analysis.

## Features

- 📸 Upload food images for automatic nutritional analysis
- 🎯 Set personalized daily calorie and macro goals
- 📊 Track your progress against goals
- 🗑️ Delete entries
- 🤖 AI-powered analysis using OpenAI or Google Gemini

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AI Provider

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` and choose your AI provider:
Using LM Studio (Local)

```bash
AI_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=openai/gpt-oss-20b
```

1. Download and install LM Studio from: https://lmstudio.ai/
2. Load your preferred model (e.g., openai/gpt-oss-20b)
3. Start the local server in LM Studio (usually runs on port 1234)
4. Update `LMSTUDIO_MODEL` to match the model you loaded

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## Usage

1. **Set Your Goals**: Click the settings icon to open the Goal Calculator. Enter your age, gender, height, weight, and activity level to get AI-calculated nutritional goals.

2. **Track Food**: Click the + button to upload a food image. The AI will analyze it and provide nutritional information.

3. **Monitor Progress**: View your daily calorie and macro intake compared to your goals.

4. **Delete Entries**: Swipe or click the delete button on any entry to remove it.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4, Framer Motion
- **AI**: OpenAI GPT-4o or Google Gemini 1.5 Flash
- **Storage**: Local JSON file storage
- **UI Components**: Radix UI, Lucide Icons

## License

MIT
