import redis from 'redis';

/*** Redis 연동 */
const redisClient = redis.createClient();
redisClient.connect();

redisClient.on('connect', () => {
  console.info('Redis connected!');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export default redisClient;
