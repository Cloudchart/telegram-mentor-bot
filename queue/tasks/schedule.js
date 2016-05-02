import moment from 'moment-timezone'
import User from '../../user'

const ScheduleDelay = 1 * 60 * 1000


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

  if (finish_time.isBefore(start_time))
    finish_time.add(1, 'day')

  let local_time = moment.tz(process.env.TIME_ZONE || 'UTC')

  console.log(local_time.isBetween(start_time, finish_time))
  // if (local_time.isAfter(start_time) && local_time.isBefore(finish_time)) {
  //   console.log('reschedule in timeout', ScheduleDelay)
  //   // Queue.enqueue('schedule', {
  //   //   user_id,
  //   //   __delay: ScheduleDelay
  //   // })
  //   return done()
  // } else {
  //   console.log('reschedule in next day', start_time.add(1, 'day').diff(local_time) / 1000 / 60 / 60)
  //   return done()
  // }

  done()
}


export default {
  perform
}

import Queue from '../../queue'
