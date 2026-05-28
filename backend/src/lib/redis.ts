import Redis from 'ioredis';

// Grab the standard connection string from environment variables
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.warn("WARNING: REDIS_URL is not defined. Falling back to localhost.");
}

// regular redis client for caching
export const redis = redisUrl
    ? new Redis(redisUrl)
    : new Redis({ host: 'localhost', port: 6379 });

// separate connection for BullMQ — MUST have maxRetriesPerRequest: null
export const bullMQRedis = redisUrl
    ? new Redis(redisUrl, { maxRetriesPerRequest: null })
    : new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

redis.on('connect', () => console.log('Redis connected successfully.'));
redis.on('error', (err) => console.error('Redis connection error:', err));

bullMQRedis.on('error', (err) => console.error('BullMQ Redis connection error:', err));