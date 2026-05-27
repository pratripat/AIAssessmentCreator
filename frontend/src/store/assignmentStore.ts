import { create } from 'zustand';
import { Assignment } from '@/types';

interface AssignmentStore {
    assignments: Assignment[];
    isLoading: boolean;
    setAssignments: (assignments: Assignment[]) => void;
    addAssignment: (assignment: Assignment) => void;
    removeAssignment: (id: string) => void;
    updateStatus: (id: string, status: Assignment['status']) => void;
    setLoading: (loading: boolean) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
    assignments: [],
    isLoading: false,

    setAssignments: (assignments) => set({ assignments }),

    addAssignment: (assignment) =>
        set((state) => ({
            assignments: [assignment, ...state.assignments],
        })),

    removeAssignment: (id) =>
        set((state) => ({
            assignments: state.assignments.filter((a) => a._id !== id),
        })),

    updateStatus: (id, status) =>
        set((state) => ({
            assignments: state.assignments.map((a) =>
                a._id === id ? { ...a, status } : a
            ),
        })),

    setLoading: (loading) => set({ isLoading: loading }),
}));