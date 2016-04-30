import FinishTimeCommand from './finish_time'

import {
  timeKeyboard,
  parseTime,
} from '../utils'

const Responses = {

  enter: `
    When should I start giving advice?
  `,

  perform: `
  `,

  perform_error: (value) => `
    *${value}* doesn't look like a time to me. Try again, Master.
  `,

  leave: (time) => `
    At *${time}*, then. Will do, Master.
  `

}

// Enter
//
let enter = async (user) => {
  user.setState({ context: 'start_time' })

  if (user.state.start_time)
    return await leave(user)

  await user.reply(Responses.enter, {
    reply_markup: {
      keyboard: timeKeyboard(),
      one_time_keyboard: true,
    }
  })
}

// Perform
//
let perform = async (user, value) => {
  value = value.trim().replace(/\s+/g, ' ')
  let time = parseTime(value)

  if (!time)
    return await user.reply(Responses.perform_error(value), {
      reply_markup: {
        keyboard: timeKeyboard(),
        one_time_keyboard: true,
      }
    })

  user.setState({ start_time: time })

  await leave(user)
}

// Leave
//
let leave = async (user) => {
  user.setState({ context: null })

  await user.reply(Responses.leave(user.state.start_time), {
    reply_markup: { hide_keyboard: true }
  })

  await FinishTimeCommand.enter(user)
}

// Exports
//
export default {
  enter,
  perform,
  leave,
}
