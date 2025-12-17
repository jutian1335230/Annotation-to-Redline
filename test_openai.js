import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extract_highlights(imageUrl) {
  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      text: {
        format: { type: "json_object" } // error handling
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `
You are an annotation highlight extraction assistant.

You are given an imageURL of a document. Your task is to identify portions of text that were visibly highlighted by the annotator and extract their character index ranges and hexadecimal background color.

Rules:
- Only extract text that is visibly highlighted.
- Indices must refer to the full extracted plain text.
- Use 0-based indexing.
- startIndex must be less than endIndex.
- endIndex is exclusive.

Output requirements:
- Return VALID JSON ONLY.
- Return an empty array [] if no highlights are found.
- Do not include explanations, markdown, or extra text.
- Return a JSON array with this structure:

[
  {
    "startIndex": number,
    "endIndex": number,
    "backgroundColor": "#RRGGBB"
  }
]

Example:
[
  { "startIndex": 5, "endIndex": 15, "backgroundColor": "#FFFF00" },
  { "startIndex": 30, "endIndex": 45, "backgroundColor": "#0096FF" }
]

              `
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: imageUrl
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

export async function extract_comments(imageUrl) {
  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      text: {
        format: { type: "json_object" } // error handling
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `
You are a handwriting and annotation interpretation expert. You are able to extract handwritten comments perfectly from messy annotated documents.

You are given an image of an annotated text and your task is to extract all handwritten annotations and return them in a list. This includes:
- Marginal notes
- Interlinear notes
- Questions
- Comments 
- Suggestions
- Literary analysis
- Symbols and punctuation

DO NOT extract printed or typed text. This is the base text and NOT an annotation. Ignore connectors, the only important thing is the content of the annotation and the separation of annotations. 

Each annotation is a single item in the list. They can be differentiated by:
- Semantic relevance
- Color use
- Separating lines
- Spatial proximity

EXTRACTION RULES:
- Transcribe handwriting exactly as written.
- If a word or character is illegible, infer it.
- Extract comments even if partially visible.
- Each distinct annotation is one item in the list.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:

[
  {
    "startIndex": number,
    "endIndex": number,
    "commentText": string
  }
]

Example:
[
  { "startIndex": 5, "endIndex": 15, "commentText": "It's a hyperbole" },
  { "startIndex": 30, "endIndex": 45, "commentText": "dancing joyfully" }
]

              `
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: imageUrl
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

export async function extract_base_text(imageUrl) {
  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `
You are a text extraction assistant.

You are given an imageURL of a document. Your task is to extract the full printed text content from the document, ignoring any annotations, handwritten notes, highlights, underlines, or other markings.

STRICT RULES:
- Extract only the baseline printed text.
- Do NOT include handwritten comments, marginalia, highlights, or formatting marks.
- Preserve all words and punctuation exactly as they appear.
- Preserve line breaks if they exist in the printed text.
- Do not add, remove, or modify any text.
- Treat the extracted text as plain text — ignore font styles, colors, or formatting.
- Do NOT include explanations, markdown, or extra text.

Example output:
"This is the full printed text extracted from the document, exactly as it appears in the image."

              `
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: imageUrl
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