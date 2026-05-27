import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
    questionNumber: number;
    text: string;
    type: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
    marks: number;
    answer?: string;
    options?: string[];
}

export interface ISection {
    sectionLabel: string; // 'A', 'B', 'C'
    title: string; // 'Short Answer Questions' or 'Multiple Choice Questions'
    instruction: string; // 'Attempt all questions. Each question carries 2 marks'
    questions: IQuestion[];
}

export interface IPaper extends Document {
    assignmentId: mongoose.Types.ObjectId;
    schoolName: string;
    subject: string;
    className: string;
    timeAllowed: string;
    maximumMarks: number;
    generalInstruction: string;   // 'All questions are compulsory unless stated otherwise'
    sections: ISection[];
    answerKey: { questionNumber: number; answer: string }[];
    generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
    questionNumber: Number,
    text: { type: String, required: true },
    type: String,
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'] },
    marks: Number,
    answer: String,
    options: { type: [String], default: [] },
});

const SectionSchema = new Schema<ISection>({
    sectionLabel: String,
    title: String,
    instruction: String,
    questions: [QuestionSchema],
});

const PaperSchema = new Schema<IPaper>({
    assignmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    schoolName: String,
    subject: String,
    className: String,
    timeAllowed: String,
    maximumMarks: Number,
    generalInstruction: String,
    sections: [SectionSchema],
    answerKey: [{ questionNumber: Number, answer: String }],
    generatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPaper>('Paper', PaperSchema);