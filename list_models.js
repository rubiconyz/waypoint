import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env.local');

let apiKey = process.env.VITE_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    console.log("Reading .env.local...");
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/VITE_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
}

if (!apiKey) {
    console.error("No API Key found!");
    process.exit(1);
}

console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

async function run() {
    try {
        const ai = new GoogleGenAI({ apiKey });

        console.log("Fetching models...");
        // Attempt standard listing methods for @google/genai SDK
        // Note: The new SDK might use `ai.models.list()` which returns an async iterator or promise
        const response = await ai.models.list();

        console.log("--- Available Models ---");
        // If response is iterable
        if (response) {
            // Check if response has 'models' property or is an array/iterator
            if (Array.isArray(response)) {
                response.forEach(m => console.log(m.name || m));
            } else if (response.models) {
                response.models.forEach(m => console.log(m.name || m));
            } else {
                console.log("Response structure:", JSON.stringify(response, null, 2));
            }
        } else {
            console.log("No response returned.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

run();
