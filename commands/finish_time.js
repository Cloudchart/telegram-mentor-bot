import LocalTimeCommand from './local_time'

import {
  timeKeyboard,
  parseTime,
} from '../utils'


const Responses = {

  enter: `
    And when do you want me to stop?
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
  await user.setState({ context: 'finish_time' })

  if (user.state.finish_time)
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
  try {
    value = value.trim().replace(/\s+/g, ' ')
    let time = parseTime(value)

    if (!time)
      return await user.reply(Responses.perform_error(value), {
        reply_markup: {
          keyboard: timeKeyboard(),
          one_time_keyboard: true,
        }
      })

    await user.setState({ finish_time: time })

    await leave(user)
  } catch (error) {
    console.log(error)
  }
}

// Leave
//
let leave = async (user) => {
  await user.setState({ context: null })

  await user.reply(Responses.leave(user.state.finish_time), {
    reply_markup: { hide_keyboard: true }
  })

  await LocalTimeCommand.enter(user)
}

// Exports
//
export default {
  enter,
  perform,
  leave,
}
