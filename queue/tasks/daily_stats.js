import moment from 'moment'
import chalk from 'chalk'

import Queue from '../../queue'
import Slack from '../../slack'
import Redis from '../../redis'


const SendAt = '06:00'


let perform_task = async (job, done) => {
  await Slack.postDailyStats()
  await Queue.enqueue('daily_stats_schedule', {})
  done()
}


let perform_schedule = async (job, done) => {
  try {

    let sendAt = moment.utc(SendAt, 'HH:mm')
    let now = moment.utc()

    if (sendAt.isBefore(now))
      sendAt.add(24, 'hours')

    // console.log(sendAt.diff(now))
    console.log(chalk.green('Queue::Tasks::ScheduleDailyStats'), chalk.blue('in', moment.duration(sendAt.diff(now)).humanize()))

    await Queue.enqueue('daily_stats_task', { __delay: sendAt.diff(now) })

  } catch(error) {

    console.trace(error)

  } finally {

    done()

  }
}


export let daily_stats_task = {
  perform: perform_task
}

export let daily_stats_schedule = {
  perform: perform_schedule
}
