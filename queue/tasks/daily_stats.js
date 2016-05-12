import moment from 'moment'
import chalk from 'chalk'

import Queue from '../../queue'
import Slack from '../../slack'
import Redis from '../../redis'


const SendAt = '06:00'


let perform_task = async (job, done) => {
  try {
    await Slack.postDailyStats()
    await Redis.hset(':bot', 'daily_stats_last_sent_at', + moment.utc())
    await Queue.enqueue('daily_stats_schedule', {})
  } catch (error) {
    console.log(error)
  } finally {
    done()
  }
}


let perform_schedule = async (job, done) => {
  try {

    let lastSentAt = await Redis.hget(':bot', 'daily_stats_last_sent_at') || 0
    let sendAt = moment.utc(SendAt, 'HH:mm')
    let now = moment.utc()

    if (sendAt.isBefore(now))
      sendAt.add(24, 'hours')

    let delay = sendAt.diff(now)
    if (now - lastSentAt > 24 * 60 * 60 * 1000)
      delay = 0

    console.log(chalk.green('Queue::Tasks::ScheduleDailyStats'), chalk.blue('in', moment.duration(delay).humanize()))

    await Queue.enqueue('daily_stats_task', { __delay: delay })

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
