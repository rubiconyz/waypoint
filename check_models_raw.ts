
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function listModelsRaw() {
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log("Fetching: " + url.replace(apiKey, "HIDDEN_KEY"));

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            console.log("SUCCESS! Available Models:");
            data.models.forEach((m: any) => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name} (${m.displayName}) - Supported: ${m.supportedGenerationMethods?.join(', ')}`);
                }
            });
        } else {
            console.log("Error response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

listModelsRaw();
