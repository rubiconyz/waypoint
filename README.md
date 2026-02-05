<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_GEMINI_PROXY_URL` in `.env.local` to your backend proxy URL (e.g. `http://localhost:3001/api/gemini`)
3. Set `GEMINI_API_KEY` in `/Users/bakhrom/Downloads/habitvision/server/.env` for the proxy
4. Run the app:
   `npm run dev`
