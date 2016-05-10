import Promise from 'bluebird'
import Redis from 'ioredis'
import kue from 'kue'
import chalk from 'chalk'

import User from '../user'
import tasks from './tasks'

let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })


kue.prototype.delayedAsync = Promise.promisify(kue.prototype.delayed)

kue.Job.getAsync = Promise.promisify(kue.Job.get)

kue.Job.prototype.removeAsync = Promise.promisify(kue.Job.prototype.remove)


const Queue = kue.createQueue({ prefix: 'queue:' + process.env.REDIS_PREFIX })


Object.keys(tasks).forEach(name => {
  console.log(chalk.green('Queue: setting up task'), chalk.blue(name))
  Queue.process(name, tasks[name].parallel || 1, tasks[name].perform)
})


let start = async () => {
  try {

    for (let id of await redis.smembers(':users'))
      await refresh(await User({ id }))

  } catch (error) {
    console.error(chalk.green('Queue::Start'), chalk.red(error))
  }
}


let refresh = async (user) => {
  let ids = await Queue.delayedAsync()

  for (let id of ids) {
    let job = await kue.Job.getAsync(id)
    if (job.type == 'schedule' && job.data.user_id == user.id)
      await job.removeAsync()
  }

  if (user.isInitialized())
    enqueue('schedule', { user_id: user.id })
}


let enqueue = (name, payload) => {
  let { __delay, ...restOfPayload } = payload
  let job = Queue.create(name, restOfPayload)
    .removeOnComplete(true)
    .delay(__delay || 0)

  if (tasks[name].onEnqueue)
    job.on('enqueue', tasks[name].onEnqueue)

  if (tasks[name].onComplete)
    job.on('complete', tasks[name].onComplete)

  return job.save()
}


let shutdown = () => {
  Queue.shutdown(5000, (error) => {
    console.log('\nKue shutdown:', error || 'done')
    process.exit(0)
  })
}


process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)


export default {
  start,
  enqueue,
  refresh,
}
