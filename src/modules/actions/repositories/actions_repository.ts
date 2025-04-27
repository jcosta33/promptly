import { PageCategory } from "../../context/models/context";
import { PARAMETER_PRESETS } from "../../inference/models/inference_model";
import { SelectionType } from "../../selection/models/selection";
import type { ActionDefinition } from "../models/action_models";

// Helper constant for actions applicable to all page categories
const ALL_PAGE_CATEGORIES = Object.values(PageCategory);

export const PREDEFINED_ACTIONS: ActionDefinition[] = [
  // Word/phrase actions
  {
    id: "define",
    name: "Define",
    description: "Provide a dictionary-style definition",
    selectionTypes: [SelectionType.WORD],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a dictionary assistant. Provide a clear, concise definition for the given word or phrase. Include the part of speech and, if applicable, example sentences. \n\n**IMPORTANT:** Format the output using extensive Markdown. Use headings (`## Definition`, `## Examples`), bold (`**word**`), italics (`*part of speech*`), and bullet points (`*`) for examples to ensure clarity and readability.",
    userPrompt: "Define the term or phrase: {{selection}}",
    llmParams: PARAMETER_PRESETS.FACTUAL,
    emoji: "📚",
  },
  {
    id: "synonyms",
    name: "Find Synonyms",
    description: "List words with similar meanings",
    selectionTypes: [SelectionType.WORD],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a thesaurus assistant. Provide a list of synonyms for the given word or phrase. Organize synonyms by different shades of meaning where applicable, and include brief notes about subtle differences in connotation or usage. \n\n**IMPORTANT:** Structure your output using extensive Markdown. Use headings (`## Meaning 1`, `## Meaning 2`), bullet points (`* synonym - *note*`), bold (`**word**`), and italics (`*nuance*`) for clarity and organization.",
    userPrompt: "List synonyms for: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🔄",
  },
  {
    id: "etymology",
    name: "Word Origin",
    description: "Explore the historical origin of a word",
    selectionTypes: [SelectionType.WORD],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are an etymology expert. Explain the origin and historical development of the given word. Trace it back to its roots if possible. \n\n**IMPORTANT:** Present the information using clear Markdown. Use headings (`## Origin`, `## History`), bold (`**language**`), italics (`*root word*`), and potentially bullet points (`*`) to break down the timeline or related words.",
    userPrompt: "Explain the etymology of: {{selection}}",
    llmParams: PARAMETER_PRESETS.FACTUAL,
    emoji: "🌱",
  },

  // Sentence actions
  {
    id: "grammar",
    name: "Check Grammar",
    description: "Fix grammar and spelling issues",
    selectionTypes: [SelectionType.SENTENCE, SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a grammar assistant. Analyze the provided text for grammatical errors, spelling mistakes, and awkward phrasing. Suggest corrections. \n\n**IMPORTANT:** Present the corrections clearly using Markdown. You could use blockquotes (`>`) for the original text, list errors with bullet points (`* **Error:** description`), and provide suggestions (`* **Suggestion:** corrected text`). Use bold/italics for emphasis.",
    userPrompt: "Check the grammar of this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "✏️",
  },
  {
    id: "rephrase",
    name: "Rephrase",
    description: "Rewrite the sentence in a different way",
    selectionTypes: [SelectionType.SENTENCE, SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a rephrasing assistant. Rewrite the provided text in a different way, maintaining its original meaning. \n\n**IMPORTANT:** Format the rewritten text using clear Markdown. Use a heading (`## Rephrased Text`) and blockquotes (`>`) for the output. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Rephrase this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🔄",
  },
  {
    id: "formal",
    name: "Make Formal",
    description: "Rewrite in a more formal tone",
    selectionTypes: [SelectionType.SENTENCE, SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a formal tone assistant. Rewrite the provided text in a more formal tone, suitable for professional or academic contexts. \n\n**IMPORTANT:** Present the rewritten text using Markdown. Use a heading (`## Formal Version`) and blockquotes (`>`) for the output. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Convert this text to a formal tone: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "👔",
  },
  {
    id: "casual",
    name: "Make Casual",
    description: "Rewrite in a more conversational tone",
    selectionTypes: [SelectionType.SENTENCE, SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a conversational tone assistant. Rewrite the provided text in a more casual, friendly tone, suitable for social media or informal communication. \n\n**IMPORTANT:** Format the rewritten text using Markdown. Use a heading (`## Casual Version`) and blockquotes (`>`) for the output. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Convert this text to a casual tone: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "💬",
  },
  {
    id: "translate",
    name: "Translate",
    description: "Translate text to another language",
    selectionTypes: [
      SelectionType.WORD,
      SelectionType.SENTENCE,
      SelectionType.PARAGRAPH,
    ],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a translation assistant. Translate the provided text into the target language (default to English if unspecified). \n\n**IMPORTANT:** Present the translation clearly using Markdown. You might use a blockquote (`>`) for the original text and then provide the translation. If translating a list or structured text, maintain the structure using Markdown lists (`*`, `1.`). Use bold (`**key term**`) for emphasis.",
    userPrompt:
      "Translate this text to a language of your choice and explain your choice: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "🌍",
  },

  // Paragraph actions
  {
    id: "summarize",
    name: "Summarize",
    description: "Create a concise summary",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.LONG_TEXT],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a summarization assistant. Create a concise summary of the provided text, capturing the main points and key information. \n\n**IMPORTANT:** Format the summary using clear Markdown. Use bullet points (`*`) for key points if helpful, or present as a well-structured paragraph. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Summarize this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "📝",
    highlight: true,
  },
  {
    id: "simplify",
    name: "Simplify",
    description: "Rewrite using simpler language",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.LONG_TEXT],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a simplification assistant. Rewrite the provided text using simpler language, shorter sentences, and more straightforward explanations. Aim for a middle-school reading level (grade 6-8) while preserving all the important information and meaning. \n\n**IMPORTANT:** Present the simplified text using Markdown. Use headings (`## Simplified Text`) and blockquotes (`>`) for the output. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Simplify this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🔍",
  },
  {
    id: "expand",
    name: "Expand",
    description: "Elaborate on the text with more details",
    selectionTypes: [SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a content expansion specialist. Take the provided text and expand it with relevant details, examples, and explanations. Maintain the original meaning and tone while making the content more comprehensive and valuable. \n\n**IMPORTANT:** Format the expanded text using extensive Markdown. Use headings (`## Expanded Text`), bullet points (`*`), and bold (`**key term**`) for emphasis.",
    userPrompt: "Expand on this text with more details: {{selection}}",
    llmParams: PARAMETER_PRESETS.CREATIVE,
    emoji: "🌱",
  },

  // Long text actions
  {
    id: "key_points",
    name: "Extract Key Points",
    description: "Identify and list main points",
    selectionTypes: [SelectionType.LONG_TEXT],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are an analysis assistant. Extract and list the key points, arguments, or insights from the provided text. Focus on identifying the most important information and organizing it in a clear, structured format. \n\n**IMPORTANT:** Present the key points using Markdown. Use a numbered list (`1.`) or bullet points (`*`) for the points. Use bold (`**topic**`) for clarity.",
    userPrompt: "Extract the key points from this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "🔑",
    highlight: true,
  },
  {
    id: "outline",
    name: "Create Outline",
    description: "Generate a structured outline",
    selectionTypes: [SelectionType.LONG_TEXT],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a structure specialist. Create a hierarchical outline from the provided text, capturing its organization, main points, and supporting details. Use a clear format with headings, subheadings, and bullet points as appropriate. \n\n**IMPORTANT:** Use extensive Markdown formatting for the outline. Employ nested bullet points (`*`, `  *`, `    *`) or numbered lists (`1.`, `  a.`, `    i.`) to show hierarchy. Use bold (`**Section Title**`) for headings.",
    userPrompt: "Create an outline for this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "📋",
  },
  {
    id: "tldr",
    name: "TL;DR",
    description: "Ultra-concise summary",
    selectionTypes: [SelectionType.LONG_TEXT, SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a brevity expert. Create an extremely concise summary (TL;DR) of the provided text in 1-2 sentences. Focus only on the most essential takeaway while dropping all supporting details and examples. \n\n**IMPORTANT:** Format the summary using Markdown. Use a heading (`## TL;DR`) and bold (`**key term**`) for emphasis.",
    userPrompt: "Create a TL;DR for this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "⚡",
  },

  // Code actions
  {
    id: "explain_code",
    name: "Explain Code",
    description: "Explain what the code does",
    selectionTypes: [SelectionType.CODE],
    pageCategories: [PageCategory.DEV_DOCS, PageCategory.CODE_REPO],
    systemPrompt:
      "You are a coding tutor. Explain the provided code snippet in a clear, step-by-step manner. Break down complex operations, identify the purpose of functions/classes, and note any important patterns, optimizations, or potential issues. Tailor your explanation to a programmer with intermediate skills. \n\n**IMPORTANT:** Use extensive Markdown formatting for the explanation. Employ headings (`## Explanation`), bullet points (`*`), inline code (`\`variable\``), and code blocks (\`\`\`language\ncode\n\`\`\`) for clarity and structure.",
    userPrompt: "Explain this code: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "💻",
    highlight: true,
  },
  {
    id: "debug_code",
    name: "Debug Code",
    description: "Find potential bugs and improvements",
    selectionTypes: [SelectionType.CODE],
    pageCategories: [PageCategory.DEV_DOCS, PageCategory.CODE_REPO],
    systemPrompt:
      "You are a code review assistant. Analyze the provided code for bugs, inefficiencies, security vulnerabilities, and style issues. Provide specific suggestions for improvements with brief explanations of why they matter. Include examples of fixed code where helpful. \n\n**IMPORTANT:** Present the feedback clearly using Markdown. Use headings (`## Suggestions`), bullet points (`* **Suggestion:** ...\n  * **Reasoning:** ...`), inline code (`\`function()\``), and code blocks (\`\`\`language\nsuggested code\n\`\`\`) to present your feedback effectively.",
    userPrompt:
      "Review this code for potential bugs and improvements: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "🐛",
  },
  {
    id: "refactor_code",
    name: "Refactor Code",
    description: "Improve code structure and readability",
    selectionTypes: [SelectionType.CODE],
    pageCategories: [PageCategory.DEV_DOCS, PageCategory.CODE_REPO],
    systemPrompt:
      "You are a code refactoring expert. Rewrite the provided code to improve its structure, readability, and maintainability while preserving its functionality. Apply appropriate design patterns, remove code smells, and follow best practices for the language in question. \n\n**IMPORTANT:** Format the refactored code using Markdown. Use code blocks (\`\`\`language\nrefactored code\n\`\`\`) for the result. Add explanatory notes using bullet points (`*`) if necessary.",
    userPrompt: "Refactor this code: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "♻️",
  },
  {
    id: "add_comments",
    name: "Add Comments",
    description: "Add helpful comments to code",
    selectionTypes: [SelectionType.CODE],
    pageCategories: [PageCategory.DEV_DOCS, PageCategory.CODE_REPO],
    systemPrompt:
      "You are a code documentation specialist. Add clear, helpful comments to the provided code that explain its purpose, functionality, and any complex or non-obvious parts. Follow documentation best practices for the language, and focus on why rather than what when appropriate. \n\n**IMPORTANT:** Use Markdown for clear formatting. Add comments within the code structure using inline comments (`#`) or block comments (`/* */`). Use bold (`**key term**`) for emphasis.",
    userPrompt: "Add comments to this code: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "💭",
  },

  // List actions
  {
    id: "organize_list",
    name: "Organize List",
    description: "Sort and structure the list",
    selectionTypes: [SelectionType.LIST],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a list organization assistant. Reorganize the provided list to make it more logical and structured. Group related items, remove duplicates, and sort items in a meaningful way (alphabetical, chronological, etc. as appropriate). Format the list for readability. \n\n**IMPORTANT:** Present the organized list using Markdown. Use headings (`## List`) and bullet points (`*`) or numbered lists (`1.`) for clarity.",
    userPrompt: "Organize this list: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "📋",
  },
  {
    id: "prioritize_list",
    name: "Prioritize List",
    description: "Order list items by importance",
    selectionTypes: [SelectionType.LIST],
    pageCategories: ALL_PAGE_CATEGORIES,
    systemPrompt:
      "You are a prioritization assistant. Analyze the items in the provided list and reorganize them based on likely importance or urgency. Explain your reasoning briefly for the top items. If the context is unclear, offer a few different prioritization schemes. \n\n**IMPORTANT:** Present the prioritized list using Markdown. Use headings (`## Prioritized List`) and bullet points (`*`) or numbered lists (`1.`) for clarity. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Prioritize this list: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🏆",
  },

  // Context-specific actions
  {
    id: "explain_term",
    name: "Explain Technical Term",
    description: "Explain technical jargon in simple terms",
    selectionTypes: [SelectionType.WORD, SelectionType.SENTENCE],
    pageCategories: [
      PageCategory.DEV_DOCS,
      PageCategory.SCIENTIFIC,
      PageCategory.CODE_REPO,
      PageCategory.DOCUMENTATION,
    ],
    systemPrompt:
      "You are a technical concept explainer. Take the selected technical term or concept and explain it in simple, accessible language. Start with a general explanation a non-expert could understand, then provide more technical detail. Include real-world examples or analogies where helpful. \n\n**IMPORTANT:** Format the explanation using Markdown. Use headings (`## Explanation`), bullet points (`*`), and bold (`**key term**`) for emphasis.",
    userPrompt: "Explain this technical term: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "💡",
  },
  {
    id: "fact_check",
    name: "Fact Check",
    description: "Evaluate factual claims",
    selectionTypes: [SelectionType.SENTENCE, SelectionType.PARAGRAPH],
    pageCategories: [
      PageCategory.NEWS,
      PageCategory.BLOG,
      PageCategory.SOCIAL,
      PageCategory.FORUM,
    ],
    systemPrompt:
      "You are a critical thinking assistant. Analyze the selected claim carefully. Identify what would be necessary to verify or refute it. Explain any logical fallacies, potential biases, or missing context. Do NOT claim to know specific facts that would require external verification. Instead, explain what kind of evidence would help evaluate the claim. \n\n**IMPORTANT:** Format your response using Markdown. State the sentiment clearly (e.g., `**Sentiment:** Positive`) and use bullet points (`*`) or a short paragraph for the justification.",
    userPrompt: "Analyze this claim: {{selection}}",
    llmParams: PARAMETER_PRESETS.FACTUAL,
    emoji: "✅",
  },
  {
    id: "generate_reply",
    name: "Generate Reply",
    description: "Draft a response to this content",
    selectionTypes: [SelectionType.PARAGRAPH],
    pageCategories: [
      PageCategory.EMAIL,
      PageCategory.SOCIAL,
      PageCategory.FORUM,
    ],
    systemPrompt:
      "You are a reply suggestion assistant. Draft a thoughtful, appropriate response to the selected text. Match the tone to the context (professional for emails, conversational for social media, etc.). Incorporate relevant details from the original message. Provide 1-3 options if the intent is ambiguous. \n\n**IMPORTANT:** Format the response using Markdown. Use a heading (`## Response`) and blockquotes (`>`) for the output. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Suggest a reply to: {{selection}}",
    llmParams: PARAMETER_PRESETS.CREATIVE,
    emoji: "↩️",
  },
  {
    id: "product_analyze",
    name: "Analyze Product",
    description: "Analyze product features and details",
    selectionTypes: [SelectionType.PARAGRAPH],
    pageCategories: [PageCategory.ECOMMERCE],
    systemPrompt:
      "You are a product analysis assistant. Analyze the product description to identify key features, specifications, potential pros and cons, and comparable alternatives. Organize information clearly to help with purchase decisions. Note if important information appears to be missing. \n\n**IMPORTANT:** Present the analysis using Markdown. Use headings (`## Features`, `## Pros and Cons`) and bullet points (`*`) for clarity.",
    userPrompt: "Analyze this product description: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🛒",
  },
  {
    id: "roast",
    name: "Roast",
    description: "Humorously critique in a light-hearted way",
    selectionTypes: [SelectionType.PARAGRAPH],
    pageCategories: [PageCategory.SOCIAL, PageCategory.FORUM],
    systemPrompt:
      "You are a comedy roast assistant. Create a light-hearted, humorous critique of the selected text. Keep it playful rather than mean-spirited. Focus on style, structure, or content quirks rather than attacking any people mentioned. Use wit, irony, and gentle sarcasm. \n\n**IMPORTANT:** Format the roast using Markdown. Use a heading (`## Roast`) and blockquotes (`>`) for the output. Use bold (`**key term**`) for emphasis.",
    userPrompt: "Humorously roast this: {{selection}}",
    llmParams: PARAMETER_PRESETS.CREATIVE,
    emoji: "🔥",
  },

  // Education-specific actions
  {
    id: "explain_concept",
    name: "Explain Concept",
    description: "Explain a concept in simple terms",
    selectionTypes: [
      SelectionType.WORD,
      SelectionType.SENTENCE,
      SelectionType.PARAGRAPH,
    ],
    pageCategories: [PageCategory.EDUCATION],
    systemPrompt:
      "You are an educational tutor. Explain the selected concept in a clear, accessible way, starting with the fundamentals and gradually adding complexity. Use analogies, examples, and visual descriptions where helpful. Adapt the explanation for a student who is encountering this topic for the first time. \n\n**IMPORTANT:** Format the explanation using Markdown. Use headings (`## Explanation`), bullet points (`*`), and bold (`**key term**`) for emphasis.",
    userPrompt: "Explain this educational concept: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "🎓",
  },
  {
    id: "create_quiz",
    name: "Generate Quiz",
    description: "Create questions about the content",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.LONG_TEXT],
    pageCategories: [
      PageCategory.EDUCATION,
      PageCategory.WIKI,
      PageCategory.DEV_DOCS,
    ],
    systemPrompt:
      "You are an educational assessment designer. Create 3-5 quiz questions based on the selected content, designed to test comprehension and critical thinking. Include a mix of question types (multiple choice, short answer, etc.) if appropriate, and provide answers or rubrics for each question. \n\n**IMPORTANT:** Format the quiz questions using Markdown. Use a numbered list (`1.`) for the questions and bold (`**question**`) for emphasis.",
    userPrompt: "Create quiz questions about: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "❓",
  },

  // Video-specific actions
  {
    id: "summarize_video",
    name: "Summarize Video",
    description: "Summarize video content from captions/comments",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.LONG_TEXT],
    pageCategories: [PageCategory.VIDEO],
    systemPrompt:
      "You are a video content analyst. Based on the selected text (which may be video captions, transcript, or description), create a concise summary of what the video likely contains. Focus on main topics, key points, and the apparent purpose of the video. \n\n**IMPORTANT:** Format the summary using Markdown. Use a heading (`## Summary`) and bullet points (`*`) for clarity.",
    userPrompt:
      "Summarize what this video is about based on this text: {{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🎬",
  },

  // Music-specific actions
  {
    id: "analyze_lyrics",
    name: "Analyze Lyrics",
    description: "Interpret meaning and themes in lyrics",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.LONG_TEXT],
    pageCategories: [PageCategory.MUSIC],
    systemPrompt:
      "You are a music analyst. Interpret the selected lyrics by identifying themes, metaphors, and potential meanings. Consider the cultural and historical context if apparent. Discuss the songwriter's possible intentions and the emotional impact of the lyrics. \n\n**IMPORTANT:** Format the analysis using Markdown. Use headings (`## Themes`, `## Interpretation`) and bullet points (`*`) for clarity.",
    userPrompt: "Analyze these lyrics: {{selection}}",
    llmParams: PARAMETER_PRESETS.CREATIVE,
    emoji: "🎵",
  },

  // Health-specific actions
  {
    id: "simplify_medical",
    name: "Simplify Medical",
    description: "Explain medical information in simple terms",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.SENTENCE],
    pageCategories: [PageCategory.HEALTH],
    systemPrompt:
      "You are a health literacy specialist. Explain the selected medical information in simple, accessible language that a layperson can understand. Break down complex terminology, explain processes clearly, and provide context for medical concepts. Don't provide medical advice - only clarify the information in the selection. \n\n**IMPORTANT:** Format the explanation using Markdown. Use headings (`## Explanation`), bullet points (`*`), and bold (`**key term**`) for emphasis.",
    userPrompt: "Simplify this medical information: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "🩺",
  },

  // Travel-specific actions
  {
    id: "plan_itinerary",
    name: "Plan Itinerary",
    description: "Suggest travel activities based on description",
    selectionTypes: [SelectionType.PARAGRAPH],
    pageCategories: [PageCategory.TRAVEL],
    systemPrompt:
      "You are a travel planning assistant. Based on the selected location description, suggest a 1-day itinerary of activities, sights, or experiences that would make for a good visit. Consider different interests, time of day, and a logical geographical flow when making suggestions. \n\n**IMPORTANT:** Format the itinerary using Markdown. Use a numbered list (`1.`) for the activities and bold (`**activity**`) for emphasis.",
    userPrompt: "Suggest an itinerary for visiting: {{selection}}",
    llmParams: PARAMETER_PRESETS.CREATIVE,
    emoji: "🧳",
  },

  // Documentation-specific actions
  {
    id: "extract_form_requirements",
    name: "Extract Requirements",
    description: "List requirements from documentation",
    selectionTypes: [SelectionType.PARAGRAPH, SelectionType.LONG_TEXT],
    pageCategories: [PageCategory.DOCUMENTATION],
    systemPrompt:
      "You are a documentation analyst. Extract all requirements, eligibility criteria, or necessary documents mentioned in the selected text. Organize them in a clear, structured list that would help someone understand what they need to do or provide. \n\n**IMPORTANT:** Present the requirements using Markdown. Use a numbered list (`1.`) or bullet points (`*`) for the requirements and bold (`**requirement**`) for emphasis.",
    userPrompt:
      "Extract the requirements from this documentation: {{selection}}",
    llmParams: PARAMETER_PRESETS.PRECISE,
    emoji: "📋",
  },
  {
    id: "simplify",
    name: "Simplify Text",
    description: "Make complex text easier to understand",
    selectionTypes: [SelectionType.SENTENCE, SelectionType.PARAGRAPH],
    pageCategories: ALL_PAGE_CATEGORIES, // Applicable everywhere
    systemPrompt:
      "You are a helpful assistant that simplifies complex text. Rephrase the provided text to be easily understandable by a general audience or a specific level (e.g., a 5th grader) if requested. \n\n**IMPORTANT:** Structure your output using extensive Markdown. Use headings (`##`), bullet points (`*`), bold (`**text**`), italics (`*text*`), and blockquotes (`>`) where appropriate to make the explanation clear, organized, and easy to read. Break down complex ideas into smaller, digestible points.",
    userPrompt: "Simplify the following text:\n\n{{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🧘",
  },
  {
    id: "translate",
    name: "Translate",
    description: "Translate text to another language (default: English)",
    selectionTypes: [
      SelectionType.WORD,
      SelectionType.SENTENCE,
      SelectionType.PARAGRAPH,
    ],
    pageCategories: ALL_PAGE_CATEGORIES, // Applicable everywhere
    systemPrompt:
      "You are a translation assistant. Translate the provided text into the target language (default to English if unspecified). \n\n**IMPORTANT:** Present the translation clearly using Markdown. You might use a blockquote (`>`) for the original text and then provide the translation. If translating a list or structured text, maintain the structure using Markdown lists (`*`, `1.`). Use bold (`**text**`) for emphasis.",
    // TODO: Add mechanism to specify target language in userPrompt
    userPrompt: "Translate the following text to English:\n\n{{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "🌐",
  },
  {
    id: "explain",
    name: "Explain This",
    description: "Provide context or clarification for the selected text",
    selectionTypes: [
      SelectionType.WORD,
      SelectionType.SENTENCE,
      SelectionType.PARAGRAPH,
    ],
    pageCategories: ALL_PAGE_CATEGORIES, // Applicable everywhere
    systemPrompt:
      "You are an explanatory assistant. Provide a clear explanation, context, or background information for the selected text. Tailor the explanation to the likely context (e.g., explain jargon, define a concept, clarify a historical reference, explain a code snippet). \n\n**IMPORTANT:** Use extensive Markdown formatting for the explanation. Employ headings (`##`), bullet points (`*`), numbered lists (`1.`), bold (`**text**`), italics (`*text*`), code blocks (\`\`\`code\`\`\` or \`code\`), and blockquotes (`>`) to structure the explanation effectively. Make it highly readable and well-organized.",
    userPrompt: "Explain the following:\n\n{{selection}}",
    llmParams: PARAMETER_PRESETS.BALANCED,
    emoji: "💡",
  },
  // -------------------
];

/**
 * Get all available actions
 */
export function get_all_actions(): ActionDefinition[] {
  return [...PREDEFINED_ACTIONS];
}
