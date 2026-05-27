import { Queue } from 'bullmq';
import { bullMQRedis } from './redis';

export const paperQueue = new Queue('generate-paper', {
    connection: bullMQRedis,
});

console.log('BullMQ queue ready');