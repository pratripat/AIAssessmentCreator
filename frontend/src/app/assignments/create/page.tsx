'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, Minus, X, Upload } from 'lucide-react';
import { createAssignment } from '@/lib/api';

interface QuestionType {
    id: string;
    type: string;
    numberOfQuestions: number;
    marks: number;
}

const QUESTION_TYPE_OPTIONS = [
    'Multiple Choice Questions',
    'Short Answer Questions',
    'Long Answer Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'True/False Questions',
    'Fill in the Blanks',
];

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [form, setForm] = useState({
        title: '',
        subject: '',
        className: '',
        schoolName: '',
        dueDate: '',
        timeAllowed: '',
        additionalInstructions: '',
    });

    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
        { id: '1', type: 'Multiple Choice Questions', numberOfQuestions: 4, marks: 1 },
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.numberOfQuestions, 0);
    const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.numberOfQuestions * qt.marks, 0);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.subject.trim()) newErrors.subject = 'Subject is required';
        if (!form.className.trim()) newErrors.className = 'Class is required';
        if (!form.schoolName.trim()) newErrors.schoolName = 'School name is required';
        if (!form.dueDate) newErrors.dueDate = 'Due date is required';
        if (questionTypes.length === 0) newErrors.questionTypes = 'Add at least one question type';
        questionTypes.forEach((qt, i) => {
            if (qt.numberOfQuestions < 1) newErrors[`qt_q_${i}`] = 'Min 1 question';
            if (qt.marks < 1) newErrors[`qt_m_${i}`] = 'Min 1 mark';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('subject', form.subject);
            formData.append('className', form.className);
            formData.append('schoolName', form.schoolName);
            formData.append('dueDate', form.dueDate);
            formData.append('timeAllowed', form.timeAllowed);
            formData.append('additionalInstructions', form.additionalInstructions);
            formData.append('questionTypes', JSON.stringify(questionTypes.map(({ id, ...rest }) => rest)));
            formData.append('totalQuestions', String(totalQuestions));
            formData.append('totalMarks', String(totalMarks));
            if (file) formData.append('file', file);

            const assignment = await createAssignment(formData);
            router.push(`/papers/${assignment._id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addQuestionType = () => {
        setQuestionTypes((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                type: QUESTION_TYPE_OPTIONS[0],
                numberOfQuestions: 1,
                marks: 1,
            },
        ]);
    };

    const removeQuestionType = (id: string) => {
        setQuestionTypes((prev) => prev.filter((qt) => qt.id !== id));
    };

    const updateQuestionType = (id: string, field: keyof QuestionType, value: string | number) => {
        setQuestionTypes((prev) =>
            prev.map((qt) => (qt.id === id ? { ...qt, [field]: value } : qt))
        );
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Create Assignment</h1>
                    <p className="text-sm text-gray-500">Set up a new assignment for your students</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200 rounded-full mt-4 mb-6">
                <div className="h-1 bg-gray-900 rounded-full w-1/2" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
                <div>
                    <h2 className="font-semibold text-gray-900">Assignment Details</h2>
                    <p className="text-sm text-gray-500">Basic information about your assignment</p>
                </div>

                {/* File Upload */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
                        }`}
                >
                    {file ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                                Choose a file or drag & drop it here
                            </p>
                            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF upto 10MB</p>
                            <label className="mt-3 inline-block cursor-pointer">
                                <span className="text-sm border border-gray-300 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    Browse Files
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </>
                    )}
                </div>
                <p className="text-xs text-gray-400 -mt-4">
                    Upload images of your preferred document/image
                </p>

                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                        <input
                            type="text"
                            placeholder="Quiz on Electricity"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
                        <input
                            type="text"
                            placeholder="Science"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Class</label>
                        <input
                            type="text"
                            placeholder="Class 8"
                            value={form.className}
                            onChange={(e) => setForm({ ...form, className: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">School Name</label>
                        <input
                            type="text"
                            placeholder="Delhi Public School"
                            value={form.schoolName}
                            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {errors.schoolName && <p className="text-xs text-red-500 mt-1">{errors.schoolName}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Due Date</label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Time Allowed</label>
                        <input
                            type="text"
                            placeholder="45 minutes"
                            value={form.timeAllowed}
                            onChange={(e) => setForm({ ...form, timeAllowed: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>
                </div>

                {/* Question Types */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Question Type</label>
                        <div className="flex gap-8 text-xs text-gray-500">
                            <span>No. of Questions</span>
                            <span>Marks</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {questionTypes.map((qt, i) => (
                            <div key={qt.id} className="flex items-center gap-3">
                                {/* Type dropdown */}
                                <select
                                    value={qt.type}
                                    onChange={(e) => updateQuestionType(qt.id, 'type', e.target.value)}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                                >
                                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>

                                {/* Number of questions counter */}
                                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5">
                                    <button
                                        onClick={() => updateQuestionType(qt.id, 'numberOfQuestions', Math.max(1, qt.numberOfQuestions - 1))}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm w-5 text-center">{qt.numberOfQuestions}</span>
                                    <button
                                        onClick={() => updateQuestionType(qt.id, 'numberOfQuestions', qt.numberOfQuestions + 1)}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* Marks counter */}
                                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5">
                                    <button
                                        onClick={() => updateQuestionType(qt.id, 'marks', Math.max(1, qt.marks - 1))}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm w-5 text-center">{qt.marks}</span>
                                    <button
                                        onClick={() => updateQuestionType(qt.id, 'marks', qt.marks + 1)}
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* Remove button */}
                                {questionTypes.length > 1 && (
                                    <button
                                        onClick={() => removeQuestionType(qt.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.questionTypes && (
                        <p className="text-xs text-red-500 mt-1">{errors.questionTypes}</p>
                    )}

                    <button
                        onClick={addQuestionType}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mt-3"
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                            <Plus size={12} />
                        </div>
                        Add Question Type
                    </button>

                    {/* Totals */}
                    <div className="mt-4 flex flex-col items-end gap-1 text-sm text-gray-600">
                        <span>Total Questions : <strong>{totalQuestions}</strong></span>
                        <span>Total Marks : <strong>{totalMarks}</strong></span>
                    </div>
                </div>

                {/* Additional Instructions */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                        Additional Information (For better output)
                    </label>
                    <textarea
                        placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                        value={form.additionalInstructions}
                        onChange={(e) => setForm({ ...form, additionalInstructions: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                    />
                </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 border border-gray-300 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Previous
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Generating...' : 'Next'}
                    {!isSubmitting && <ArrowRight size={16} />}
                </button>
            </div>
        </div>
    );
}