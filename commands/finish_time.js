import chalk from 'chalk'

import ExecutionChains from '../execution_chains'
import { protect } from './utils'
import {
  timeKeyboard,
  parseTime,
} from '../utils'


let Command = (name, ...rest) => chalk.green(`Command::FinishTime::${name}`, ...rest)


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
    When should I finish giving advice?
  `,

  enter_has_time: (value) => `
    Your current finish time is *${value}*.
    When should I finish giving advice?

    Or you can /cancel.
  `,

  perform_error: (value) => `
    *${value}* doesn't look like a time to me. Try again, Master.
  `,

  leave: (value) => `
    I will be giving you advice till *${value}*
  `,

  leave_cancel: (value) =>  `
    Ok, then.
    I will continue giving you advice till *${value}*
  `

}


let enter = async (user, options = {}) => {
  await protect(Command('Enter', user.id), async () => {

    await user.setState({ context: 'finish_time' })

    let response = options.response
      ? options.response
      : user.state.finish_time
        ? Responses.enter_has_time(user.state.finish_time)
        : Responses.enter()

    await user.reply(response, ReplyMarkup)

  })
}


let perform = async (user, value, options = {}) => {
  await protect(Command('Perform', user.id, value), async () => {

    if (user.state.context != 'finish_time' && !value)
      return await enter(user, options)

    value = value.trim()

    if (value === '/cancel' && user.state.finish_time)
      return await leave(user, { response: Responses.leave_cancel(user.state.finish_time) })

    let finish_time = parseTime(value)

    if (!finish_time)
      return await enter(user, { response: Responses.perform_error(value) })

    await user.setState({ finish_time })

    await leave(user)

  })
}


let leave = async (user, options = {}) => {
  await protect(Command('Leave', user.id), async () => {

    if (user.state.execution_chain)
      return await ExecutionChains[user.state.execution_chain].next(user)

    await user.setState({ context: null })

    await user.reply(options.response || Responses.leave(user.state.finish_time), HideReplyMarkup)

  })
}


export default {
  perform
}
