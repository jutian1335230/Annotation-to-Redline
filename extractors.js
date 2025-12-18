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
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are an annotation and handwriting-extraction OCR vision assistant.

You are given an image of an annotated document. Your task is to extract:

1) The full printed baseline text
2) All true marker highlights WITH CHARACTER INDICES
3) All handwritten comments WITH CHARACTER INDICES

========================================
PART 1 — BASE TEXT EXTRACTION
========================================

Extract the full printed or typed text from the document.

STRICT RULES:
- Extract ONLY the baseline printed text.
- Do NOT include handwritten comments, marginalia, highlights, underlines, or other markings.
- Preserve all characters, punctuation, spacing, and line breaks EXACTLY. For example, keep "hole.\n       They" as is, do not change to "hole.\nThey".
- Do not add, remove, or normalize text. For example, keep "hole.\n       They" as is, do not change to "hole.\nThey".

This extracted text will be used as the reference for ALL indices below.

========================================
PART 2 — HIGHLIGHT EXTRACTION
========================================

Extract all highlighted sections by specifying the words, start index, end index, and highlight color and returning them in a list. ONLY include the highlighted words and nothing else.

It is very possible there are no highlighted words. A highlighted segment is ONLY text that has a transparent colored marker applied directly OVER the letters in a continuous horizontal stroke. You must avoid other annotations. This means:

- DO NOT INCLUDE circled or partially encircled text
- DO NOT INCLUDE text outlined with a pen or pencil
- DO NOT INCLUDE underlined or overlined text
- DO NOT INCLUDE boxed text
- DO NOT INCLUDE text connected by arrows or lines
- DO NOT INCLUDE text marked with brackets
- DO NOT INCLUDE text touched by handwritten notes
- DO NOT INCLUDE colored because of ink or pen, not marker
- Double check your start and end indices to ensure they match the extracted base text.

If the color does not sit ON TOP OF the letters like a highlighter, it is NOT a highlight.

Circles, loops, ovals, or colored pen or pencil strokes around text are NEVER highlights.
Lines drawn through or under text are NEVER highlights.
Color touching text without filling the letter shapes is NEVER a highlight. 

Rules:
- Indices must refer to the extracted base text.
- Use 0-based indexing.
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
- If illegible, infer the most likely text (autocorrect).

For EACH handwritten comment:
- Identify the printed text span it most directly refers to.
- Compute startIndex and endIndex relative to the extracted base text (0-based indexing).

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
      "highlightedText": string,
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

Before returning the final JSON, internally verify that:
- for each highlight, [startIndex:endIndex] exactly equals highlightedText

If no base text, highlights or comments exist, return empty arrays.
Do NOT include explanations, markdown, or extra text.
              `
            },
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
