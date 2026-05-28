'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, X, Calendar, UploadCloud, ChevronDown } from 'lucide-react';
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
        title: '', subject: '', className: '', schoolName: '',
        dueDate: '', timeAllowed: '', additionalInstructions: '',
    });
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
        { id: '1', type: 'Multiple Choice Questions', numberOfQuestions: 4, marks: 1 },
        { id: '2', type: 'Short Answer Questions', numberOfQuestions: 3, marks: 2 },
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
        setQuestionTypes((prev) => [...prev, {
            id: Date.now().toString(), type: QUESTION_TYPE_OPTIONS[0], numberOfQuestions: 1, marks: 1,
        }]);
    };

    const removeQuestionType = (id: string) => {
        setQuestionTypes((prev) => prev.filter((qt) => qt.id !== id));
    };

    const updateQt = (id: string, field: keyof QuestionType, value: string | number) => {
        setQuestionTypes((prev) => prev.map((qt) => qt.id === id ? { ...qt, [field]: value } : qt));
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    };

    return (
        <div className="min-h-screen bg-[#F6F6F7] dark:bg-[#0F0F0F] font-['Inter']">
            {/* Top Header */}
            <div className="flex items-center gap-3 border-b border-[#ECECEC] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-7 py-4">
                <button onClick={() => router.back()} className="text-[#6B6B6B] dark:text-[#888] transition hover:text-black dark:hover:text-white">
                    <ArrowLeft size={18} />
                </button>
                <span className="text-[14px] font-medium text-[#8B8B8B] dark:text-[#555]">Assignment</span>
            </div>

            <div className="mx-auto max-w-[760px] px-6 py-7">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#49C267]" />
                        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#181818] dark:text-white">
                            Create Assignment
                        </h1>
                    </div>
                    <p className="ml-5 mt-1 text-[14px] text-[#9B9B9B] dark:text-[#555]">
                        Set up a new assignment for your students
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-7 h-[5px] overflow-hidden rounded-full bg-[#E4E4E4] dark:bg-[#2a2a2a]">
                    <div className="h-full w-1/2 rounded-full bg-[#5C5C5C] dark:bg-white" />
                </div>

                {/* Main Card */}
                <div className="rounded-[32px] border border-[#ECECEC] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-6 py-7 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                    <div className="mb-6">
                        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1A1A1A] dark:text-white">
                            Assignment Details
                        </h2>
                        <p className="mt-1 text-[13px] text-[#9A9A9A] dark:text-[#555]">
                            Basic information about your assignment
                        </p>
                    </div>

                    {/* Upload */}
                    <div className="mb-6">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            className={`rounded-[24px] border-2 border-dashed px-6 py-10 text-center transition ${dragOver
                                    ? 'border-[#BDBDBD] bg-[#FAFAFA] dark:bg-[#1a1a1a]'
                                    : 'border-[#E2E2E2] dark:border-[#2a2a2a]'
                                }`}
                        >
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <p className="text-[14px] font-medium text-black dark:text-white">{file.name}</p>
                                    <button onClick={() => setFile(null)} className="text-[#A5A5A5] hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-[#1f1f1f]">
                                            <UploadCloud size={22} className="text-[#555] dark:text-[#888]" />
                                        </div>
                                    </div>
                                    <p className="text-[15px] font-medium text-[#242424] dark:text-white">
                                        Choose a file or drag & drop it here
                                    </p>
                                    <p className="mt-1 text-[12px] text-[#A0A0A0] dark:text-[#555]">JPEG, PNG, upto 10MB</p>
                                    <label className="mt-5 inline-block cursor-pointer">
                                        <span className="rounded-full bg-[#F4F4F4] dark:bg-[#2a2a2a] px-5 py-2 text-[13px] font-medium text-[#3A3A3A] dark:text-[#ccc] transition hover:bg-[#ECECEC] dark:hover:bg-[#333]">
                                            Browse Files
                                        </span>
                                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                    </label>
                                </>
                            )}
                        </div>
                        <p className="mt-2 text-center text-[12px] text-[#A1A1A1] dark:text-[#555]">
                            Upload images of your preferred document/image
                        </p>
                    </div>

                    {/* Form Fields */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        {[
                            { label: 'Title', value: form.title, key: 'title', placeholder: 'Quiz on Electricity' },
                            { label: 'Subject', value: form.subject, key: 'subject', placeholder: 'Science' },
                            { label: 'Class', value: form.className, key: 'className', placeholder: 'Class 8' },
                            { label: 'School Name', value: form.schoolName, key: 'schoolName', placeholder: 'Delhi Public School' },
                            { label: 'Time Allowed', value: form.timeAllowed, key: 'timeAllowed', placeholder: '45 Minutes' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="mb-2 block text-[13px] font-medium text-[#404040] dark:text-[#aaa]">
                                    {field.label}
                                </label>
                                <input
                                    type="text"
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                    className="h-[48px] w-full rounded-[16px] border border-[#E7E7E7] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] px-4 text-[14px] font-medium text-black dark:text-white placeholder:text-[#A8A8A8] outline-none transition focus:border-[#CFCFCF] dark:focus:border-[#444]"
                                />
                                {errors[field.key] && (
                                    <p className="mt-1 text-[12px] text-red-500">{errors[field.key]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Due Date */}
                    <div className="mb-6">
                        <label className="mb-2 block text-[13px] font-medium text-[#404040] dark:text-[#aaa]">
                            Due Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="h-[50px] w-full rounded-[16px] border border-[#E7E7E7] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] px-4 pr-11 text-[14px] font-medium text-black dark:text-white outline-none transition focus:border-[#D0D0D0] dark:focus:border-[#444]"
                            />
                            <Calendar size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] dark:text-[#555]" />
                        </div>
                        {errors.dueDate && <p className="mt-1 text-[12px] text-red-500">{errors.dueDate}</p>}
                    </div>

                    {/* Question Types */}
                    <div className="mb-6">
                        <div className="mb-3 grid grid-cols-[1fr_110px_90px_20px] gap-3 text-[12px] font-medium text-[#7B7B7B] dark:text-[#555]">
                            <span>Question Type</span>
                            <span className="text-center">No. of Questions</span>
                            <span className="text-center">Marks</span>
                            <span />
                        </div>

                        <div className="space-y-3">
                            {questionTypes.map((qt) => (
                                <div key={qt.id} className="grid grid-cols-[1fr_110px_90px_20px] items-center gap-3">
                                    <div className="relative">
                                        <select
                                            value={qt.type}
                                            onChange={(e) => updateQt(qt.id, 'type', e.target.value)}
                                            className="h-[48px] w-full appearance-none rounded-[16px] border border-[#E7E7E7] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] px-4 pr-10 text-[14px] font-medium text-black dark:text-white outline-none"
                                        >
                                            {QUESTION_TYPE_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#777] dark:text-[#555]" />
                                    </div>

                                    <div className="flex h-[48px] items-center justify-between rounded-full border border-[#E7E7E7] dark:border-[#2a2a2a] bg-[#FCFCFC] dark:bg-[#1a1a1a] px-3">
                                        <button onClick={() => updateQt(qt.id, 'numberOfQuestions', Math.max(1, qt.numberOfQuestions - 1))}
                                            className="text-[18px] text-[#7A7A7A] dark:text-[#666]">−</button>
                                        <span className="text-[14px] font-semibold text-black dark:text-white">{qt.numberOfQuestions}</span>
                                        <button onClick={() => updateQt(qt.id, 'numberOfQuestions', qt.numberOfQuestions + 1)}
                                            className="text-[18px] text-[#7A7A7A] dark:text-[#666]">+</button>
                                    </div>

                                    <div className="flex h-[48px] items-center justify-between rounded-full border border-[#E7E7E7] dark:border-[#2a2a2a] bg-[#FCFCFC] dark:bg-[#1a1a1a] px-3">
                                        <button onClick={() => updateQt(qt.id, 'marks', Math.max(1, qt.marks - 1))}
                                            className="text-[18px] text-[#7A7A7A] dark:text-[#666]">−</button>
                                        <span className="text-[14px] font-semibold text-black dark:text-white">{qt.marks}</span>
                                        <button onClick={() => updateQt(qt.id, 'marks', qt.marks + 1)}
                                            className="text-[18px] text-[#7A7A7A] dark:text-[#666]">+</button>
                                    </div>

                                    <button onClick={() => removeQuestionType(qt.id)} disabled={questionTypes.length === 1}
                                        className="text-[#B0B0B0] transition hover:text-red-500">
                                        <X size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button onClick={addQuestionType}
                            className="mt-4 flex items-center gap-2 text-[14px] font-medium text-[#4A4A4A] dark:text-[#aaa]">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1F1F1F] dark:bg-white text-white dark:text-black">
                                <Plus size={13} />
                            </div>
                            Add Question Type
                        </button>

                        <div className="mt-5 flex flex-col items-end text-[14px] text-[#555] dark:text-[#888]">
                            <span>Total Questions: <strong className="text-black dark:text-white">{totalQuestions}</strong></span>
                            <span>Total Marks: <strong className="text-black dark:text-white">{totalMarks}</strong></span>
                        </div>
                    </div>

                    {/* Additional */}
                    <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#404040] dark:text-[#aaa]">
                            Additional Information (For better output)
                        </label>
                        <textarea
                            placeholder="e.g Generate a question paper for 3 hour exam duration..."
                            value={form.additionalInstructions}
                            onChange={(e) => setForm({ ...form, additionalInstructions: e.target.value })}
                            rows={4}
                            className="w-full resize-none rounded-[20px] border border-[#E7E7E7] dark:border-[#2a2a2a] bg-[#FCFCFC] dark:bg-[#1a1a1a] px-4 py-4 text-[14px] font-medium text-black dark:text-white placeholder:text-[#A8A8A8] outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between">
                    <button onClick={() => router.back()}
                        className="flex h-[50px] items-center gap-2 rounded-full border border-[#E6E6E6] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-6 text-[14px] font-medium text-[#444] dark:text-[#aaa] shadow-sm transition hover:bg-[#F8F8F8] dark:hover:bg-[#1f1f1f]">
                        <ArrowLeft size={15} />
                        Previous
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting}
                        className="flex h-[50px] items-center gap-2 rounded-full bg-[#111111] dark:bg-white dark:text-black px-7 text-[14px] font-medium text-white shadow-lg transition hover:opacity-90 disabled:opacity-60">
                        {isSubmitting ? 'Generating...' : 'Next'}
                        {!isSubmitting && <ArrowRight size={15} />}
                    </button>
                </div>
            </div>
        </div>
    );
}