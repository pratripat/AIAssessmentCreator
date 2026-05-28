// backend/src/lib/llm.ts
import Groq from 'groq-sdk';
import { IAssignment } from '../models/Assignment';

// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY,
// });

const getGroqClient = () => {
    return new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
};

const buildPrompt = (assignment: IAssignment, pdfText: string): string => {
    const sections = assignment.questionTypes
        .map((qt, i) => {
            const label = String.fromCharCode(65 + i);
            return `- Section ${label}: ${qt.numberOfQuestions} x ${qt.type} (${qt.marks} marks each)`;
        })
        .join('\n');

    const pdfContext = pdfText
        ? `\nReference Material (generate questions based on this content):\n"""\n${pdfText}\n"""\n`
        : '';

    return `You are an expert teacher creating a formal exam question paper.
  ${pdfContext}
  Assignment Details:
  - School: ${assignment.schoolName}
  - Subject: ${assignment.subject}
  - Class: ${assignment.className}
  - Total Marks: ${assignment.totalMarks}
  - Total Questions: ${assignment.totalQuestions}
  - Time Allowed: ${assignment.timeAllowed || '3 hours'}
  - Additional Instructions: ${assignment.additionalInstructions || 'None'}
  
  Question Sections Required:
  ${sections}
  
  Generate a complete question paper. Return ONLY a valid JSON object, no markdown, no backticks, no explanation.
  
  The JSON must follow this exact structure:
  {
    "schoolName": "${assignment.schoolName}",
    "subject": "${assignment.subject}",
    "className": "${assignment.className}",
    "timeAllowed": "${assignment.timeAllowed || '3 hours'}",
    "maximumMarks": ${assignment.totalMarks},
    "generalInstruction": "All questions are compulsory unless stated otherwise.",
    "sections": [
      {
        "sectionLabel": "A",
        "title": "<question type name>",
        "instruction": "Attempt all questions. Each question carries X marks.",
        "questions": [
          {
            "questionNumber": 1,
            "text": "<full question text>",
            "type": "<question type>",
            "difficulty": "Easy",
            "marks": 2,
            "options": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"],
            "answer": "<answer>"
          }
        ]
      }
    ],
    "answerKey": [
      {
        "questionNumber": 1,
        "answer": "<answer>"
      }
    ]
  }
  
  CRITICAL RULES FOR SPECIFIC QUESTION TYPES:
  1. "Multiple Choice Questions" → MUST include "options" array with exactly 4 options formatted as ["A. ...", "B. ...", "C. ...", "D. ..."]
  2. "True/False Questions" → MUST include "options" array: ["A. True", "B. False"]
  3. "Fill in the Blanks" → question text MUST contain a blank represented as "______"
  4. "Match the Following" → question text MUST list items to match clearly
  5. "Short Answer Questions", "Long Answer Questions", "Numerical Problems", "Diagram/Graph-Based Questions" → "options" should be an empty array []
  
  OTHER RULES:
  - difficulty must be exactly "Easy", "Moderate", or "Challenging"
  - Distribute difficulty: roughly 30% Easy, 50% Moderate, 20% Challenging (Do follow any additional instructions over this if given any)
  - Questions must be relevant to the subject and class level
  - Each section maps to one question type
  - answerKey must have an entry for every question across all sections
  - questionNumber must be continuous across all sections (1, 2, 3... not restarting per section)
  - Return ONLY the JSON, nothing else`;
};

export const generatePaper = async (assignment: IAssignment, pdfText: string = '') => {
    const groq = getGroqClient();

    const prompt = buildPrompt(assignment, pdfText);

    const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.7,
        max_tokens: 4000,
    });

    const raw = response.choices[0]?.message?.content || '';

    // parse safely
    const parsed = safeParseJSON(raw);

    if (!parsed) {
        throw new Error('LLM returned invalid JSON');
    }

    // validate structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error('LLM response missing sections array');
    }

    return parsed;
};

const safeParseJSON = (raw: string) => {
    try {
        // sometimes LLMs add ```json ... ``` even when told not to, strip it
        const cleaned = raw
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        return JSON.parse(cleaned);
    } catch {
        // try to extract JSON object if there's extra text
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return null;
            }
        }
        return null;
    }
};