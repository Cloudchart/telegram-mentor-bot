import chalk from 'chalk'

import ExecutionChains from '../execution_chains'
import { protect } from './utils'
import {
  timeKeyboard,
  parseTime,
} from '../utils'


let Command = (name, ...rest) => chalk.green(`Command::StartTime::${name}`, ...rest)


let ReplyMarkup = {
  reply_markup: {
    keyboard: timeKeyboard(),
    one_time_keyboard: true,
  }
}

let HideReplyMarkup = {
  reply_markup: {
    hide_keyboard: true
  }
}


const Responses = {

  enter: () => `
    When should I start giving advice?
  `,

  enter_has_time: (start_time) => `
    Your current start time is *${start_time}*.
    When should I start giving advice?

    Or you can /cancel.
  `,

  perform_error: (value) => `
    *${value}* doesn't look like a time to me. Try again, Master.
  `,

  leave: (start_time) => `
    I will be giving you advice from *${start_time}*
  `,

  leave_cancel: (start_time) =>  `
    Ok, then.
    I will continue giving you advice from *${start_time}*
  `

}


let enter = async (user, options = {}) => {
  await protect(Command('Enter', user.id), async () => {

    await user.setState({ context: 'start_time' })

    let response = options.response
      ? options.response
      : user.state.start_time
        ? Responses.enter_has_time(user.state.start_time)
        : Responses.enter()

    await user.reply(response, ReplyMarkup)

  })
}


let perform = async (user, value, options = {}) => {
  await protect(Command('Perform', user.id, value), async () => {

    if (user.state.context != 'start_time' && !value)
      return await enter(user, options)

    value = value.trim()

    if (value === '/cancel' && user.state.start_time)
      return await leave(user, { response: Responses.leave_cancel(user.state.start_time) })

    let start_time = parseTime(value)

    if (!start_time)
      return await enter(user, { response: Responses.perform_error(value) })

    await user.setState({ start_time })

    await leave(user)

  })
}


let leave = async (user, options = {}) => {
  await protect(Command('Leave', user.id), async () => {

    await user.setState({ context: null })

    if (user.state.execution_chain)
      return await ExecutionChains[user.state.execution_chain].next(user, 'start_time')

    await user.reply(options.response || Responses.leave(user.state.start_time), HideReplyMarkup)

  })
}


export default {
  perform
}
