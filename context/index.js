import Redis from 'ioredis'


let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })


let get = async (id) =>
  JSON.parse(await redis.lindex(`:user:${id}:context`, 0))

let set = async (id, data) =>
  await redis.lset(`:user:${id}:context`, 0, JSON.stringify(data))

let pop = async (id) =>
  await redis.lopo(`:user:${id}:context`)

export default {
  get,
  set,
  pop,
}
