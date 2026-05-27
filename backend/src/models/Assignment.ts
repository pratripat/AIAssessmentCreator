import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionTypeConfig {
    type: string; // 'Multiple Choice Questions', 'Short Questions', etc.
    numberOfQuestions: number;
    marks: number; // marks per question
}

export interface IAssignment extends Document {
    title: string;
    subject: string;
    className: string; // 'Class 5th', 'Grade 8' etc
    schoolName: string;
    dueDate: Date;
    timeAllowed?: string; // '45 minutes', '3 hours'
    questionTypes: IQuestionTypeConfig[];
    totalQuestions: number;
    totalMarks: number;
    additionalInstructions?: string;
    fileUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
}

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>({
    type: { type: String, required: true },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    schoolName: { type: String, required: true },
    dueDate: { type: Date, required: true },
    timeAllowed: { type: String },
    questionTypes: [QuestionTypeConfigSchema],
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String },
    fileUrl: { type: String },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);