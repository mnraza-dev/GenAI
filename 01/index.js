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
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "hey, how are you ?" }
    ],    
  });

  console.log(response.choices[0].message.content);
}

main()