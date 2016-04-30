import moment from 'moment'

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
  user.setState({ context: 'local_time' })
  return await user.reply(Responses.enter(user))
}


let perform = async (user, value, options = {}) => {
  if (user.state.context !== 'local_time' && !value)
    return enter(user, options)

  let time = parseTime(value)

  if (!time)
    return await user.reply(Responses.perform(user, value))

  try {
    let utc_offset = moment(time, 'HH:mm').diff(moment(), 'hours') * 60 + moment().utcOffset()
    user.setState({ utc_offset })

    await leave(user, options)
  } catch(e) { console.log(e) }
}


let leave = async (user, options = {}) => {
  user.setState({ context: null, initialized: true })

  return await user.reply(Responses.leave(user))
}


export default {
  enter,
  perform,
  leave,
}
