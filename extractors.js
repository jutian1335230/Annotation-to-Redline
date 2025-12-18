import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extract_document_annotations(imageUrl) {
  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      text: {
        format: { type: "json_object" }
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `
You are an annotation and handwriting-extraction OCR vision assistant.

You are given an image of an annotated document. Your task is to extract:

1) The full printed baseline text
2) All true marker highlights
3) All handwritten comments WITH CHARACTER INDICES

========================================
PART 1 — BASE TEXT EXTRACTION
========================================

Extract the full printed or typed text from the document.

STRICT RULES:
- Extract ONLY the baseline printed text.
- Do NOT include handwritten comments, marginalia, highlights, underlines, or other markings.
- Preserve all characters, punctuation, spacing, and line breaks EXACTLY.
- Do not add, remove, or normalize text.

This extracted text will be used as the reference for ALL indices below.

========================================
PART 2 — HIGHLIGHT EXTRACTION
========================================

Identify portions of text that were visibly highlighted by a transparent marker applied DIRECTLY over the letters.

DO NOT INCLUDE:
- Circled or partially encircled text
- Text outlined with pen or pencil
- Underlined or overlined text
- Boxed text
- Text connected by arrows or lines
- Text marked with brackets
- Text touched by handwritten notes
- Text colored by ink or pen (not marker)

Rules:
- Indices must refer to the extracted base text.
- Use 0-based indexing.
- startIndex < endIndex.
- endIndex is exclusive.

========================================
PART 3 — HANDWRITTEN COMMENT EXTRACTION
========================================

Extract ALL handwritten annotations, including:
- Marginal notes
- Interlinear notes
- Questions
- Comments
- Suggestions
- Literary analysis
- Symbols and punctuation

RULES:
- DO NOT extract printed or typed text.
- Transcribe handwriting exactly as written.
- If illegible, infer the most likely text.
- Each distinct annotation is ONE item.

For EACH handwritten comment:
- Identify the printed text span it most directly refers to.
- Compute startIndex and endIndex relative to the extracted base text.
- If the comment refers to a line or phrase, span that phrase.
- Do NOT invent indices unrelated to the printed text.

========================================
OUTPUT FORMAT (STRICT)
========================================

Return ONLY valid JSON with EXACTLY this structure:

{
  "baseText": string,
  "highlights": [
    {
      "startIndex": number,
      "endIndex": number,
      "backgroundColor": "#RRGGBB"
    }
  ],
  "comments": [
    {
      "startIndex": number,
      "endIndex": number,
      "commentText": string
    }
  ]
}

If no highlights or comments exist, return empty arrays.
Do NOT include explanations, markdown, or extra text.
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

    return JSON.parse(response.output_text);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
