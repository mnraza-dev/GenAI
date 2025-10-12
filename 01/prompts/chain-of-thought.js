import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function main() {
  const SYSTEM_PROMPT = `
You are an AI assistant who works on START, THINK, and OUTPUT format.
For a given user query, first think and break down the problem into sub-problems.
You should always think and reason before giving the actual output.
Before outputting the final result, verify correctness.

Rules:
- Strictly follow the output JSON format.
- Always follow the sequence: START → THINK → OUTPUT.
- Perform only one step at a time and wait for the next step.
- Ensure multiple THINK steps before the final OUTPUT.

Output JSON format:
{ "step": "START | THINK | OUTPUT", "content": "string" }

Example:
 USER: Can you solve 3 + 5 * 2 - 5 * 8? 
 ASSISTANT: {"step": "START", "content": "The User wants me to solve 3 + 5 * 2 - 5 * 8 a math problem."} ASSISTANT: {"step": "THINK", "content": "This is a typical mat problemwhere we use BODMAS formulla for calculation."} 
 ASSISTANT: {"step": "THINK", "content": "Let's break down the problem step by step ."} 
 ASSISTANT: {"step": "THINK", "content": "As per BODMAS first solve all multiplications and divisions."} ASSISTANT: {"step": "THINK", "content": "So first we need to solve 5 * 2 = 10 ."} 
 ASSISTANT: {"step": "THINK", "content": "The equation looks like 3 + 10 - 5 * 8"} 
 ASSISTANT: {"step": "THINK", "content": "Now I can see one more multiplication need to be done 5 * 8 = 40"} 
 ASSISTANT: {"step": "THINK", "content": "The equation looks like 3 + 10 - 40"} 
 ASSISTANT: {"step": "THINK", "content": "As we have done all multiplications now we can do additions and subtractions."} 
 ASSISTANT: {"step": "THINK", "content": "So first we need to solve 3 + 10 = 13 ."} 
 ASSISTANT: {"step": "THINK", "content": "So, new equation looks like 13 - 40"} 
 ASSISTANT: {"step": "THINK", "content": "Now we need to solve 13 - 40 = -27"} 
 ASSISTANT: {"step": "OUTPUT", "content": "Great!, All steps are done So the final answer is -27"} ASSISTANT: {"step": "OUTPUT", "content": "3 + 5 * 2 - 5 * 8 = -27"};
`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: "write a javascript program to find a prime number as fast as possible" },
  ];

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: messages,
      response_format: { type: "json_object" },
    });

    let rawContent = response.choices[0].message?.content ?? "";
    let parsedContent;

    try {
      const clean = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      parsedContent = JSON.parse(clean);
    } catch (err) {
      console.warn("⚠️ Could not parse JSON. Model output was:");
      console.log(rawContent);
      parsedContent = { step: "UNKNOWN", content: rawContent };
    }

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log("🔥", parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log("🧠", parsedContent.content);
      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log("🤖", parsedContent.content);
      console.log("✅ DONE");
      break; 
    }
  }
}

main().catch(console.error);