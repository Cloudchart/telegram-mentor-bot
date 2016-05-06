import chalk from 'chalk'

import Queue from '../queue'
import StartCommand from './start'
import { protect } from './utils'

let Command = (name) => chalk.green(`Command::Restart::${name}`)


let resetUser = async (user) => {
  await user.resetState()
  let topics = await user.topics()
  for (let topic of topics.subscribedTopics)
    await user.mutate('unsubscribeFromTopic', { topic_id: topic.id })
  await user.topics(true)
}


const ConfirmationMessage = `YES`


const Responses = {
  enter: `
    Would you like to reset my machinery to choose different topics and schedule?
    Type *${ConfirmationMessage}* to reset.
  `,

  leave_success: `
    As you wish, Master. Resetting now.
  `,

  leave_failure: `
    Okay, business as usual.
  `,
}


let enter = async (user, options = {}) => {
  await protect(Command('Enter'), async () => {

    await user.setState({ context: 'restart' })

    if (options.response)
      return await user.reply(options.response)

    return await user.reply(Responses.enter)

  })
}

let perform = async (user, value) => {
  await protect(Command('Perform'), async () => {

    if (user.state.context != 'restart')
      return await enter(user)

    value = value.trim()

    if (value != ConfirmationMessage)
      return await leave(user, { status: 'failure' })

    return await leave(user, { status: 'success' })

  })
}


let leave = async (user, options = {}) => {
  await protect(Command('Leave'), async () => {

    await user.setState({ context: null })

    if (options.response)
      return await user.reply(options.response)

    if (options.status == 'failure')
      return await user.reply(Responses.leave_failure)

    if (options.status == 'success') {
      await user.reply(Responses.leave_success)

      await resetUser(user)
      await Queue.refresh(user)

      await StartCommand.perform(user)
    }

  })
}


export default {
  perform
}
