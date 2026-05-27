// src/components/AssignmentsClient.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AssignmentsList from '@/components/AssignmentsList';
import { getAssignments } from '@/lib/api';
import { Assignment } from '@/types';

export default function AssignmentsClient() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getAssignments();
                setAssignments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <AssignmentsList
            initialAssignments={assignments}
            onDelete={(id) => setAssignments((prev) => prev.filter((a) => a._id !== id))}
        />
    );
}