export interface QuestionTypeConfig {
    type: string;
    numberOfQuestions: number;
    marks: number;
}

export interface Assignment {
    _id: string;
    title: string;
    subject: string;
    className: string;
    schoolName: string;
    dueDate: string;
    timeAllowed?: string;
    questionTypes: QuestionTypeConfig[];
    totalQuestions: number;
    totalMarks: number;
    additionalInstructions?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
}

export interface Question {
    questionNumber: number;
    text: string;
    type: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
    marks: number;
    answer?: string;
    options?: string[];  // A, B, C, D for MCQs
}

export interface Section {
    sectionLabel: string;
    title: string;
    instruction: string;
    questions: Question[];
}

export interface Paper {
    _id: string;
    assignmentId: string;
    schoolName: string;
    subject: string;
    className: string;
    timeAllowed: string;
    maximumMarks: number;
    generalInstruction: string;
    sections: Section[];
    answerKey: { questionNumber: number; answer: string }[];
    generatedAt: string;
}