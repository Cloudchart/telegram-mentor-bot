import moment from 'moment-timezone'
import User from '../../user'

const ScheduleDelay = 2 * 60 * 60 * 1000


let perform = async (job, done) => {

  let { user_id } = job.data

  let user = await User({ id: user_id })
  let {
    start_time,
    finish_time,
    utc_offset,
    scheduled_insight_sent_at
  } = user.state

  start_time = moment.utc(start_time, 'HH:mm').subtract(utc_offset, 'minutes')
  finish_time = moment.utc(finish_time, 'HH:mm').subtract(utc_offset, 'minutes')
  let local_time = moment.tz(process.env.TIME_ZONE || 'UTC').utc()

  let start_hours = start_time.hours()
  let finish_hours = finish_time.hours()
  let local_hours = local_time.hours()

  if (start_hours > finish_hours)
    finish_hours += 24

  if (local_hours >= start_hours && local_hours <= finish_hours) {

    Queue.enqueue('scheduled_insight', {
      user_id
    })

    Queue.enqueue('schedule', {
      user_id,
      __delay: ScheduleDelay
    })

  } else {

    Queue.enqueue('schedule', {
      user_id,
      __delay: start_time.add(24, 'hours').diff(local_time)
    })

  }

  done()
}


export default {
  perform
}

import Queue from '../../queue'
