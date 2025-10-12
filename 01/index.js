import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function main() {
    const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
            { role: "user", content: "hey, My name is MN Raza." },
            {
                role: "assistant",
                content: "Okay, MN Raza. Nice to meet you! How can I help you today?",
            }, {
                role: "user",
                content: "What is my name ?",
            }
        ],
    });

    console.log(response.choices[0].message.content);
}

main()