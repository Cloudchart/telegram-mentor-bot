import moment from 'moment-timezone'
import chalk from 'chalk'
import User from '../../user'

const ScheduleDelay = 2 * 60 * 60 * 1000


let perform = async (job, done) => {

  try {
    let { user_id } = job.data

    let user = await User({ id: user_id })
    let {
      start_time,
      finish_time,
      utc_offset,
    } = user.state

    let start = moment.utc(user.state.start_time, 'HH:mm').subtract(user.state.utc_offset, 'minutes')
    let finish = moment.utc(user.state.finish_time, 'HH:mm').subtract(user.state.utc_offset, 'minutes')
    let now = moment.tz(process.env.TIME_ZONE || 'UTC').utc()

    if (finish.isBefore(start)) finish.add(1, 'day')
    if (now.isBefore(start) && !now.isAfter(finish)) now.add(1, 'day')


    if (now.isBetween(start, finish)) {
      let delay = ScheduleDelay - now.diff(moment.utc(user.state.scheduled_at || 0))

      if (delay <= 0) {
        console.log(
          chalk.green('Queue::Tasks::Schedule: sending insight for user'),
          chalk.blue(user.id),
        )

        Queue.enqueue('scheduled_insight', {
          user_id,
        })

        user.setState({ ...user.state, scheduled_at: now.format() })

        delay = ScheduleDelay
      }

      console.log(
        chalk.green('Queue::Tasks::Schedule: sending insight for user'),
        chalk.blue(user.id),
        chalk.green('in ' + moment.duration(delay).humanize())
      )

      Queue.enqueue('schedule', {
        user_id,
        __delay: delay
      })


    } else {
      if (start.isBefore(now)) start.add(1, 'day')

      console.log(
        chalk.green('Queue::Tasks::Schedule: sending insight for user'),
        chalk.blue(user.id),
        chalk.green('in ' + moment.duration(start.diff(now)).humanize())
      )

      Queue.enqueue('schedule', {
        user_id,
        __delay: start.diff(now)
      })
    }

  } catch(error) {

    console.log(chalk.green('Queue::Tasks::Schedule'), chalk.red(error))

  } finally {

    return done()

  }

  done()
}


export default {
  perform
}

import Queue from '../../queue'
