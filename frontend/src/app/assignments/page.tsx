'use client';

import { useEffect, useState } from 'react';
import AssignmentsList from '@/components/AssignmentsList';
import { getAssignments } from '@/lib/api';
import { Assignment } from '@/types';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAssignments = async () => {
      try {
        const data = await getAssignments();

        if (mounted) {
          setAssignments(data);
        }
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAssignments();

    return () => {
      mounted = false;
    };
  }, []);

  // ONLY show fullscreen loader on first load
  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AssignmentsList
      initialAssignments={assignments}
      onDelete={(id) =>
        setAssignments((prev) =>
          prev.filter((a) => a._id !== id)
        )
      }
    />
  );
}