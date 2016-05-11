import Redis from 'ioredis'

export default new Redis({ keyPrefix: process.env.REDIS_PREFIX })
