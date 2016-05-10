import moment from 'moment'
import Queue from '../queue'

const TimeZone = process.env.TIME_ZONE || 'UTC'

let timeZone = (utcOffset) => {
  let sign  = utcOffset > 0 ? '+' : ''
  let hours = Math.floor(utcOffset / 60) || ''
  return `GMT${ sign }${ hours }`
}


import {
  parseTime,
} from '../utils'

const Responses = {

  enter: () => `
    To make my setup laser-sharp, could you please tell me your local time?
  `
  ,

  perform: () => `
  `
  ,

  perform_error: (user, value) => `
    *${value}* doesn't look like a time to me. Try again, Master.
  `
  ,

  leave: (user) => {
    let { start_time, finish_time, utc_offset } = user.state
    return `
      I am now fully operational. I will be giving you advice from ${start_time} to ${finish_time}, and your time zone is ${timeZone(utc_offset)}.
      You can always change that in my settings.
    `
  }
  ,
}


let enter = async (user, options = {}) => {
  await user.setState({ context: 'local_time' })
  return await user.reply(Responses.enter(user))
}


let perform = async (user, value, options = {}) => {
  if (user.state.context !== 'local_time' && !value)
    return enter(user, options)

  let time = parseTime(value)

  if (!time)
    return await user.reply(Responses.perform_error(user, value))

  let local_time = moment.utc().startOf('hour')
  let client_time = moment.utc(time, 'HH:mm').startOf('hour')
  let offset = local_time.diff(client_time, 'hours')

  if (offset > 12)
    offset = 24 - offset

  if (offset < -12)
    offset = 24 + offset

  offset = offset * 60

  await user.setState({ utc_offset: offset })

  await leave(user, options)
}


let leave = async (user, options = {}) => {
  await user.setState({ context: null, initialized: true })
  await Queue.refresh(user)

  return await user.reply(Responses.leave(user))
}


export default {
  enter,
  perform,
  leave,
}
