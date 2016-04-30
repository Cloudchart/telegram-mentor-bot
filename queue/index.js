import Redis from 'ioredis'
import kue from 'kue'
import chalk from 'chalk'
import moment from 'moment'

import User from '../user'
import tasks from './tasks'

let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })

const Queue = kue.createQueue({ prefix: 'queue:' + process.env.REDIS_PREFIX })


Object.keys(tasks).forEach(name => {
  console.log(chalk.green('Queue: setting up task'), chalk.blue(name))
  Queue.process(name, tasks[name].perform)
})


let start = async () => {
  try {
    let users = JSON.parse(await redis.get('users')) || []

    users.forEach(async id => {
      let user = await User({ id })
      if (!user.state.initialized) return

      let has_delayed_job = false

      Queue.delayed((error, ids) => {
        ids.forEach(id => {
          kue.Job.get(id, (error, job) => {
            if (job.data.user_id !== user.id) return
            has_delayed_job = true
          })
        })
      })

      if (has_delayed_job) return



    })

  } catch (error) {
    console.error(chalk.green('Queue'), chalk.red(error))
  }
}


let refresh = () => start()


let enqueue = (name, payload) => {
  let job = Queue.create(name, payload).removeOnComplete(true)
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
}
