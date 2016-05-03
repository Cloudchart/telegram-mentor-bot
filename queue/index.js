import Bluebird from 'bluebird'
import Redis from 'ioredis'
import kue from 'kue'
import chalk from 'chalk'

import User from '../user'
import tasks from './tasks'

let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })

const Queue = kue.createQueue({ prefix: 'queue:' + process.env.REDIS_PREFIX })


Object.keys(tasks).forEach(name => {
  console.log(chalk.green('Queue: setting up task'), chalk.blue(name))
  Queue.process(name, tasks[name].perform)
})

// let promisifiedDelayedKueTasks = Bluebird.promisify(Queue.delayed)
kue.Job.asyncGet = Bluebird.promisify(kue.Job.get)

let start = async () => {
  try {

    Queue.delayed((error, ids) => {
      Promise.all(ids.map(id => kue.Job.asyncGet(id)))
        .then(async jobs => {
          jobs.forEach(job => job.remove())

          let users = JSON.parse(await redis.get('users')) || []

          users.forEach(async id => {
            let user = await User({ id })
            if (!user.state.initialized) return
            enqueue('schedule', { user_id: user.id })
          })
        })
    })

    // let users = JSON.parse(await redis.get('users')) || []
    //
    // users.forEach(async id => {
    //   let user = await User({ id })
    //   if (!user.state.initialized) return
    //
    //   Queue.delayed(async (error, ids) => {
    //
    //     let promises = ids.map(id => promisifiedGetKueJob(id))
    //
    //     Promise.all(promises).then(jobs => {
    //       jobs.forEach()
    //       console.log(jobs.map(job => job.type))
    //       console.log('here')
    //     })
    //   })
      // promisifiedDelayedKueTasks.then(ids => {
      //   console.log(ids)
      // }).catch(console.log)
      // await promisifiedDelayedKueTasks((error, ids) => {
      //   ids.forEach(async id => {
      //     let job = await promisifiedGetKueJob(id)
      //     console.log(job)
      //     // kue.Job.get(id, (error, job) => {
      //     //   if (job.data.user_id == user.id && job.type == 'schedule') {
      //     //     job.remove()
      //     //   }
      //     // })
      //   })
      // })

      //
      // console.log(has_delayed_job)
      //
      // if (has_delayed_job) return
      //
      // enqueue('schedule', { user_id: user.id })

    // })

  } catch (error) {
    console.error(chalk.green('Queue'), chalk.red(error))
  }
}


let refresh = () => start()


let enqueue = (name, payload) => {
  let { __delay, ...restOfPayload } = payload
  let job = Queue.create(name, restOfPayload)
    .removeOnComplete(true)
    .delay(__delay || 0)
    .save()
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
