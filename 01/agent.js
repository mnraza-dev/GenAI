import OpenAI from "openai";
import "dotenv/config";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function getWeatherDataByCity(cityname) {
  const url = `https://wttr.in/${cityname.toLowerCase()}?format=%C+%t`;
  const { data } = await axios.get(url, { responseType: 'text' })
  return `The current weather of ${cityname} is ${data}`;
}

const TOOL_MAP = {
  getWeatherDataByCity: getWeatherDataByCity,
}

async function main() {
  const SYSTEM_PROMPT = `
You are an AI assistant who works on START, THINK, and OUTPUT format.
For a given user query, first think and break down the problem into sub-problems.
You should always think and reason before giving the actual output.
Before outputting the final result, verify correctness.
You also have access to a tool that can fetch current weather information for a specified city.
For every tool call you make , wait for the OBSERVATION from the tool which  is the response from the tool that you called.

Available tool:
1. getWeatherDataByCity(cityname): This function takes a city name as input and returns the current weather information for that city.

Rules:
- Strictly follow the output JSON format.
- Always follow the sequence: START → THINK → OBSERVE → OUTPUT.
- Perform only one step at a time and wait for the next step.
- Ensure multiple THINK steps before the final OUTPUT.
- For every tool call you make , wait for the OBSERVE from the tool which  is the response from the tool that you called.


Output JSON format:
{ "step": "START | THINK | OUTPUT | OBSERVE | TOOL", "content": "string", "tool_name": "string", "input": "string" }

Example:
 USER: Hey, can you tell me the current weather of bangalore City? 
 ASSISTANT: {"step": "START", "content": "The User is interested in the current weather details of the bangalore city ."} 
 ASSISTANT: {"step": "THINK", "content": "Let me see if there is any available tool for this query."} 
 ASSISTANT: {"step": "THINK", "content": "I see there is a tool that available getWeatherDataByCity which returns current weather details."} 
 ASSISTANT: {"step": "THINK", "content": "I need to call for getWeatherDataByCity for city bangalore to get the weather data."} 
  ASSISTANT: {"step": "TOOL", "input": "bangalore","tool_name": "getWeatherDataByCity"}
  ASSISTANT: {"step": "OBSERVE", "content": "The weather of bangalore is cloudy 27 Cel"}
  ASSISTANT: {"step": "THINK", "content": "Great, I have the weather data now I can provide the final output to the user."}
  ASSISTANT: {"step": "OUTPUT", "content": "The current weather of bangalore is cloudy 27 Cel"};
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

    if (parsedContent.step === "TOOL") {
      const toolFunction = parsedContent.tool_name;
      if (TOOL_MAP[toolFunction]) {
        messages.push({
          "role": "developer",
          "content": `There is no such tool as ${toolFunction}, please check the tool name again.`
        });
        continue;
      }
      const responseFromTool = await TOOL_MAP[toolFunction](parsedContent.input).then((toolResponse) => {
        messages.push({
          role: "developer",
          content: JSON.stringify({ "step": "OBSERVE", "content": responseFromTool }),
        });
      })
    }
  if (parsedContent.step === "OUTPUT") {
    console.log("🤖", parsedContent.content);
    console.log("✅ DONE");
    break;
  }
}
}

main().catch(console.error);
getWeatherDataByCity("bangalore").then(console.log).catch(console.error);
