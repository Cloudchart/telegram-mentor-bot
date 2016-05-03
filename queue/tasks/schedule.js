import moment from 'moment-timezone'
import chalk from 'chalk'
import User from '../../user'

const ScheduleDelay = 15 * 60 * 1000


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

        Queue.enqueue('schedule', {
          user_id,
          __delay: ScheduleDelay
        })

      } else {

        console.log(
          chalk.green('Queue::Tasks::Schedule: sending insight for user'),
          chalk.blue(user.id),
          chalk.green('in ' + moment.duration(delay).humanize())
        )

        Queue.enqueue('schedule', {
          user_id,
          __delay: delay
        })

      }

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

    done()

  }


  // start_time = moment.utc(start_time, 'HH:mm').subtract(utc_offset, 'minutes')
  // finish_time = moment.utc(finish_time, 'HH:mm').subtract(utc_offset, 'minutes')
  // let local_time = moment.tz(process.env.TIME_ZONE || 'UTC').utc()


  // let start_hours = start_time.hours()
  // let finish_hours = finish_time.hours()
  // let local_hours = local_time.hours()
  //
  // if (local_hours >= start_hours && local_hours <= finish_hours) {
  //
  //   Queue.enqueue('scheduled_insight', {
  //     user_id
  //   })
  //
  //   Queue.enqueue('schedule', {
  //     user_id,
  //     __delay: ScheduleDelay
  //   })
  //
  // } else {
  //
  //   if (local_time.isBefore(start_time))
  //     Queue.enqueue('schedule', {
  //       user_id,
  //       __delay: start_time.diff(local_time)
  //     })
  //
  //   if (local_time.isAfter(finish_time))
  //     Queue.enqueue('schedule', {
  //       user_id,
  //       __delay: local_time.diff(start_time.add(1, 'day'))
  //     })
  //
  // }

  done()
}


export default {
  perform
}

import Queue from '../../queue'
