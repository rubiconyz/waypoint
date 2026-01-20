
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Manually load .env.local since we are running in node
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function listModels() {
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
        console.error("VITE_API_KEY not found in .env.local");
        return;
    }
    console.log("Using API Key:", apiKey.substring(0, 8) + "...");

    const ai = new GoogleGenAI({ apiKey });

    try {
        console.log("Fetching available models...");
        // The SDK might use 'listModels' on the client or specific endpoint
        // For @google/genai specifically, it varies. Let's try basic list.
        const response = await ai.models.list();
        // Debug: Log everything to standard error or console to see structure
        console.log("Full Response Structure:", JSON.stringify(response, (key, value) => {
            // Avoid circular refs if any
            if (key === 'auth') return '[Auth]';
            return value;
        }, 2));

        // Try to access the internal page if possible or iterate
        // The list() method usually returns a ListModelsResponse or AsyncIterable

        console.log("\nAttempting iteration...");
        // @ts-ignore
        if (response && typeof response[Symbol.iterator] === 'function') {
            // @ts-ignore
            for (const model of response) {
                if (model.name.includes('gemini')) {
                    console.log(`- ${model.name} (${model.displayName})`);
                }
            }
        } else {
            console.log("Response is not iterable.");
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
