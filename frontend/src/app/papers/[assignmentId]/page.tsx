'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, ArrowLeft, RefreshCw } from 'lucide-react';
import { getPaper } from '@/lib/api';
import { Paper } from '@/types';
import { wsClient } from '@/lib/websocket';

export default function PaperPage() {
    const { assignmentId } = useParams();
    const router = useRouter();
    const [paper, setPaper] = useState<Paper | null>(null);
    const [status, setStatus] = useState<'loading' | 'processing' | 'done' | 'failed'>('loading');

    useEffect(() => {
        // connect websocket
        wsClient.connect();

        // listen for job updates
        const unsub = wsClient.onMessage((msg) => {
            if (msg.assignmentId !== assignmentId) return;

            if (msg.type === 'JOB_COMPLETED') {
                fetchPaper();
            } else if (msg.type === 'JOB_FAILED') {
                setStatus('failed');
            } else if (msg.type === 'JOB_STARTED') {
                setStatus('processing');
            }
        });

        // try fetching immediately (might already be done)
        fetchPaper();

        return () => unsub();
    }, [assignmentId]);

    const fetchPaper = async () => {
        try {
            const data = await getPaper(assignmentId as string);
            setPaper(data);
            setStatus('done');
        } catch {
            // paper not ready yet — worker is still processing
            setStatus('processing');
        }
    };

    if (status === 'loading' || status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">
                    {status === 'loading' ? 'Loading paper...' : 'AI is generating your question paper...'}
                </p>
                <p className="text-xs text-gray-400">This usually takes 10–20 seconds</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-red-500 font-medium">Generation failed</p>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-600 underline"
                >
                    Go back and try again
                </button>
            </div>
        );
    }

    if (!paper) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Action bar */}
            <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setStatus('processing');
                            setPaper(null);
                            fetchPaper();
                        }}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Regenerate
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-700 transition-colors"
                    >
                        <Download size={14} />
                        Download as PDF
                    </button>
                </div>
            </div>

            {/* Paper */}
            <div
                id="paper-content"
                className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-10 print:rounded-none print:border-none print:p-8"
            >
                {/* School header */}
                <div className="text-center mb-6 border-b border-gray-200 pb-6">
                    <h1 className="text-xl font-bold text-gray-900">{paper.schoolName}</h1>
                    <p className="text-sm text-gray-600 mt-1">Subject: {paper.subject}</p>
                    <p className="text-sm text-gray-600">Class: {paper.className}</p>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-700">
                    <span>Time Allowed: {paper.timeAllowed}</span>
                    <span>Maximum Marks: {paper.maximumMarks}</span>
                </div>

                {/* General instruction */}
                <p className="text-sm text-gray-700 mb-4 italic">{paper.generalInstruction}</p>

                {/* Student info */}
                <div className="flex flex-col gap-2 mb-8 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <span>Name:</span>
                        <span className="border-b border-gray-400 w-48 inline-block" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Roll Number:</span>
                        <span className="border-b border-gray-400 w-36 inline-block" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Class: {paper.className} &nbsp; Section:</span>
                        <span className="border-b border-gray-400 w-24 inline-block" />
                    </div>
                </div>

                {/* Sections */}
                {paper.sections.map((section) => (
                    <div key={section.sectionLabel} className="mb-8">
                        <h2 className="text-base font-bold text-gray-900 mb-1">
                            Section {section.sectionLabel}
                        </h2>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">{section.title}</h3>
                        <p className="text-xs text-gray-500 italic mb-4">{section.instruction}</p>

                        <div className="space-y-4">
                            {section.questions.map((question) => (
                                <div key={question.questionNumber} className="flex gap-3">
                                    <span className="text-sm font-medium text-gray-700 shrink-0 w-6">
                                        {question.questionNumber}.
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm text-gray-800">{question.text}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${question.difficulty === 'Easy'
                                                        ? 'bg-green-100 text-green-700'
                                                        : question.difficulty === 'Moderate'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {question.difficulty}
                                                </span>
                                                <span className="text-xs text-gray-500 shrink-0">
                                                    [{question.marks} Mark{question.marks > 1 ? 's' : ''}]
                                                </span>
                                            </div>
                                        </div>

                                        {/* Options for MCQ / True-False */}
                                        {question.options && question.options.length > 0 && (
                                            <div className="mt-2 grid grid-cols-2 gap-1">
                                                {question.options.map((option, i) => (
                                                    <p key={i} className="text-sm text-gray-700">{option}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <p className="text-sm font-semibold text-gray-700 mt-8 mb-6">End of Question Paper</p>

                {/* Answer Key */}
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Answer Key:</h2>
                    <div className="space-y-3">
                        {paper.answerKey.map((item) => (
                            <div key={item.questionNumber} className="flex gap-3 text-sm">
                                <span className="font-medium text-gray-700 shrink-0 w-6">
                                    {item.questionNumber}.
                                </span>
                                <p className="text-gray-600">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print styles */}
            <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #paper-content, #paper-content * { visibility: visible; }
          #paper-content { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none; }
        }
      `}</style>
        </div>
    );
}