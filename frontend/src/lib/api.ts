import axios from 'axios';
import { Assignment, Paper } from '@/types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export const getAssignments = async (): Promise<Assignment[]> => {
    const res = await api.get('/api/assignments', {
        headers: { 'Cache-Control': 'no-store' },
        params: { _t: Date.now() }, // cache buster
    });
    return res.data.data;
};

export const createAssignment = async (formData: FormData): Promise<Assignment> => {
    const res = await api.post('/api/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
    await api.delete(`/api/assignments/${id}`);
};

export const getPaper = async (assignmentId: string): Promise<Paper> => {
    const res = await api.get(`/api/papers/${assignmentId}`);
    return res.data.data;
};