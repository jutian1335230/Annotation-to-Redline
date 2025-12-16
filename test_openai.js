import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runTest() {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      text: {
        format: { type: "json_object" } // error handling
      },
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Extract the highlighted text from this image. Return your response in Json format {text1: color1, text2: color2}" },
            {
              type: "input_image",
              image_url: "https://iili.io/fc9UPkl.md.png"
            }
          ]
        }
      ]
    });

    console.log("GPT Response:", response.output_text);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

runTest();
