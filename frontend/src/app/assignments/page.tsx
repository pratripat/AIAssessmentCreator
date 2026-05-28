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

  // ONLY show fullscreen loader on first load (Styled safely for both light and dark backgrounds)
  if (loading && assignments.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F7] dark:bg-[#0F0F0F] transition-colors duration-200">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#EA580C] border-t-transparent" />
      </div>
    );
  }

  return (
    // Added dark:bg-[#0F0F0F] here to remove the hardcoded light block overlay
    <div className="bg-[#F6F6F7] dark:bg-[#0F0F0F] transition-colors duration-200">
      <AssignmentsList
        initialAssignments={assignments}
        onDelete={(id) =>
          setAssignments((prev) =>
            prev.filter((a) => a._id !== id)
          )
        }
      />
    </div>
  );
}