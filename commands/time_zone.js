import moment from 'moment'
import chalk from 'chalk'

import ExecutionChains from '../execution_chains'
import { protect } from './utils'
import {
  parseTime,
  timeZoneFromUTC
} from '../utils'


let Command = (name, ...rest) => chalk.green(`Command::TimeZone::${name}`, ...rest)


const ReplyMarkup = {
  reply_markup: {
    hide_keyboard: true
  }
}


const Responses = {

  enter: () => `
    When should I start giving advice?
  `,

  enter_has_time_zone: (time_zone) => `
    Your current start time is *${time_zone}*.
    When should I start giving advice?

    Or you can /cancel.
  `,

  perform_error: (value) => `
    *${value}* doesn't look like a time to me. Try again, Master.
  `,

  leave: (time_zone) => `
    I will be giving you advice from *${time_zone}*
  `,

  leave_cancel: (time_zone) =>  `
    Ok, then.
    I will continue giving you advice from *${time_zone}*
  `

}


let enter = async (user, options = {}) => {
  await protect(Command('Enter', user.id), async () => {

    await user.setState({ context: 'time_zone' })

    if (options.response)
      return await user.reply(options.response, ReplyMarkup)

    if (user.state.utc_offset)
      return await user.reply(Responses.enter_has_time_zone(timeZoneFromUTC(user.state.utc_offset)), ReplyMarkup)

    await user.reply(Responses.enter)

  })
}


let perform = async (user, value, options = {}) => {
  await protect(Command('Perform', user.id, value), async () => {

    if (user.state.context != 'time_zone' || !value)
      return await enter(user, options)

    value = value.trim()

    if (value === '/cancel' && user.state.utc_offset)
      return await leave(user, { response: Responses.leave_cancel(timeZoneFromUTC(user.state.utc_offset)) })

    let local_time = parseTime(value)

    if (!local_time)
      return await user.reply(Responses.perform_error(value), ReplyMarkup)

    let server_time = moment.utc().startOf('hour')
    let client_time = moment.utc(local_time, 'HH:mm').startOf('hour')
    let utc_offset = client_time.diff(server_time, 'hours')

    if (utc_offset > 12)
      utc_offset = 24 - utc_offset

    if (utc_offset < -12)
      utc_offset = 24 + utc_offset

    utc_offset = utc_offset * 60

    await user.setState({ utc_offset })

    await leave(user, options)

  })
}


let leave = async (user, options = {}) => {
  await protect(Command('Leave', user.id), async () => {

    if (user.state.execution_chain)
      return await ExecutionChains[user.state.execution_chain].next(user)

    await user.setState({ context: null })

    await user.reply(options.response || Responses.leave(timeZoneFromUTC(user.state.utc_offset)), ReplyMarkup)

  })
}


export default {
  perform
}
