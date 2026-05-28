'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, ArrowLeft, RefreshCw } from 'lucide-react';
import { getPaper, regeneratePaper } from '@/lib/api';
import { Paper } from '@/types';
import { wsClient } from '@/lib/websocket';

export default function PaperPage() {
    const { assignmentId } = useParams();
    const router = useRouter();
    const [paper, setPaper] = useState<Paper | null>(null);
    const [status, setStatus] = useState<'loading' | 'processing' | 'done' | 'failed'>('loading');

    useEffect(() => {
        wsClient.connect();
        const unsub = wsClient.onMessage((msg) => {
            if (msg.assignmentId !== assignmentId) return;
            if (msg.type === 'JOB_COMPLETED') fetchPaper();
            else if (msg.type === 'JOB_FAILED') setStatus('failed');
            else if (msg.type === 'JOB_STARTED') setStatus('processing');
        });
        fetchPaper();
        return () => unsub();
    }, [assignmentId]);

    const fetchPaper = async () => {
        try {
            const data = await getPaper(assignmentId as string);
            setPaper(data);
            setStatus('done');
        } catch {
            setStatus('processing');
        }
    };

    if (status === 'loading' || status === 'processing') {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#F7F7F8] dark:bg-[#0F0F0F] gap-5 font-['Inter']">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#111111] dark:border-white border-t-transparent" />
                <div className="text-center">
                    <p className="text-[15px] font-medium text-[#202020] dark:text-white">
                        {status === 'loading' ? 'Loading paper...' : 'AI is generating your question paper...'}
                    </p>
                    <p className="mt-1 text-[13px] text-[#8A8A8A] dark:text-[#555]">This usually takes 10–20 seconds</p>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#F7F7F8] dark:bg-[#0F0F0F] gap-4 font-['Inter']">
                <p className="text-[16px] font-semibold text-red-500">Generation failed</p>
                <button onClick={() => router.back()} className="text-sm text-[#666] dark:text-[#888] underline">
                    Go back and try again
                </button>
            </div>
        );
    }

    if (!paper) return null;

    return (
        <div className="min-h-screen bg-[#F5F5F6] dark:bg-[#0F0F0F] px-6 py-6 font-['Inter']">
            {/* Action Bar */}
            <div className="mx-auto mb-5 flex max-w-[980px] items-center justify-between">
                <button onClick={() => router.back()}
                    className="flex items-center gap-2 text-[14px] font-medium text-[#666] dark:text-[#888] transition hover:text-black dark:hover:text-white">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            setStatus('processing');
                            setPaper(null);
                            await regeneratePaper(assignmentId as string);
                        }}
                        className="flex h-[42px] items-center gap-2 rounded-full border border-[#E7E7E7] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-5 text-[14px] font-medium text-[#333] dark:text-[#ccc] shadow-sm transition hover:bg-[#F7F7F7] dark:hover:bg-[#1f1f1f]"
                    >
                        <RefreshCw size={14} />
                        Regenerate
                    </button>
                    <button onClick={() => window.print()}
                        className="flex h-[42px] items-center gap-2 rounded-full bg-[#111111] dark:bg-white dark:text-black px-5 text-[14px] font-medium text-white shadow-lg transition hover:opacity-90">
                        <Download size={14} />
                        Download as PDF
                    </button>
                </div>
            </div>

            {/* Paper */}
            <div
                id="paper-content"
                className="mx-auto max-w-[980px] rounded-[28px] border border-[#E9E9E9] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-14 py-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] print:rounded-none print:border-none print:shadow-none"
            >
                {/* School Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-[#1A1A1A] dark:text-white">
                        {paper.schoolName}
                    </h1>
                    <div className="mt-3 space-y-1">
                        <p className="text-[17px] font-medium text-[#333] dark:text-[#ccc]">Subject: {paper.subject}</p>
                        <p className="text-[17px] font-medium text-[#333] dark:text-[#ccc]">Class: {paper.className}</p>
                    </div>
                </div>

                {/* Meta */}
                <div className="mb-6 flex items-center justify-between text-[14px] font-medium text-[#303030] dark:text-[#aaa]">
                    <span>Time Allowed: {paper.timeAllowed}</span>
                    <span>Maximum Marks: {paper.maximumMarks}</span>
                </div>

                {/* Instruction */}
                <p className="mb-8 text-[14px] text-[#444] dark:text-[#888]">{paper.generalInstruction}</p>

                {/* Student Info */}
                <div className="mb-12 space-y-3 text-[14px] text-[#222] dark:text-[#ccc]">
                    <div className="flex items-center gap-2">
                        <span>Name:</span>
                        <span className="inline-block w-48 border-b border-[#666] dark:border-[#444]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Roll Number:</span>
                        <span className="inline-block w-36 border-b border-[#666] dark:border-[#444]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Class: {paper.className} Section:</span>
                        <span className="inline-block w-24 border-b border-[#666] dark:border-[#444]" />
                    </div>
                </div>

                {/* Sections */}
                {paper.sections.map((section) => (
                    <div key={section.sectionLabel} className="mb-12">
                        <h2 className="mb-6 text-center text-[28px] font-semibold tracking-[-0.02em] text-[#1E1E1E] dark:text-white">
                            Section {section.sectionLabel}
                        </h2>
                        <h3 className="text-[18px] font-semibold text-[#222] dark:text-[#ddd]">{section.title}</h3>
                        <p className="mt-1 mb-6 text-[13px] italic text-[#777] dark:text-[#555]">{section.instruction}</p>

                        <div className="space-y-5">
                            {section.questions.map((question) => (
                                <div key={question.questionNumber} className="flex gap-4">
                                    <span className="w-6 shrink-0 pt-[1px] text-[15px] font-medium text-[#333] dark:text-[#aaa]">
                                        {question.questionNumber}.
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-[15px] leading-7 text-[#242424] dark:text-[#ddd]">
                                            <span className={`font-medium ${question.difficulty === 'Easy' ? 'text-green-600 dark:text-green-400' :
                                                    question.difficulty === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                                                        'text-red-600 dark:text-red-400'
                                                }`}>
                                                [{question.difficulty}]
                                            </span>{' '}
                                            {question.text}{' '}
                                            <span className="text-[#666] dark:text-[#555]">
                                                [{question.marks} Mark{question.marks > 1 ? 's' : ''}]
                                            </span>
                                        </p>
                                        {question.options && question.options.length > 0 && (
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {question.options.map((option, i) => (
                                                    <p key={i} className="text-[14px] text-[#444] dark:text-[#888]">{option}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <p className="mt-10 mb-10 text-[15px] font-semibold text-[#222] dark:text-[#ddd]">
                    End of Question Paper
                </p>

                {/* Answer Key */}
                <div className="border-t border-[#E8E8E8] dark:border-[#2a2a2a] pt-8">
                    <h2 className="mb-6 text-[26px] font-semibold tracking-[-0.02em] text-[#1A1A1A] dark:text-white">
                        Answer Key:
                    </h2>
                    <div className="space-y-5">
                        {paper.answerKey.map((item) => (
                            <div key={item.questionNumber} className="flex gap-4">
                                <span className="w-6 shrink-0 text-[15px] font-medium text-[#333] dark:text-[#aaa]">
                                    {item.questionNumber}.
                                </span>
                                <p className="text-[14px] leading-7 text-[#444] dark:text-[#888]">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #paper-content, #paper-content * { visibility: visible; }
          #paper-content { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
        }
      `}</style>
        </div>
    );
}