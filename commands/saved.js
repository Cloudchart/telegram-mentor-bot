import Queue from '../queue'

import chalk from 'chalk'
import { protect } from './utils'

let Command = (name, ...rest) => chalk.green(`Command::Saved::${name}`, ...rest)


const Responses = {

  enter: () => `
    Please choose a topic to see your saved advice
  `,

  enter_no_topic: (topicName) => `
    You have no saved advice on *${topicName}*
  `,

  leave_cancel: () => `
    Ok then. Business as usual.
  `,

  leave_no_topics: () => `
    You have no topics with insights you liked.
  `,

  leave_with_topic: (topic) => `
    Ok, here’s the advice you saved on *${topic.name}*
  `

}


let enter = async (user, options = {}) => {
  await protect(Command('Enter', user.id), async () => {

    await user.setState({ context: 'saved' })

    await user.reply(options.response || await Responses.enter(), {
      reply_markup: {
        keyboard: [['Done']].concat(options.topics.map(topic => [topic.name])),
        one_time_keyboard: true,
        resize_keyboard: true,
      }
    })


  })
}


let perform = async (user, value, options = {}) => {
  await protect(Command('Perform', user.id), async () => {

    let topics = await user.topics().then(({ defaultTopics }) => defaultTopics.filter(topic => topic.hasPositiveInsightsByViewer))

    if (topics.length === 0)
      return await leave(user, { ...options, response: await Responses.leave_no_topics() })

    if (user.state.context != 'saved' && !value)
      return await enter(user, { ...options, topics })

    let query = value.toLowerCase()

    if (query === '/cancel' || query === 'done')
      return await leave(user, { ...options, response: await Responses.leave_cancel() })

    let topic = topics.find(topic => topic.name.toLowerCase() === query)

    if (!topic)
      return await enter(user, { ...options, topics, response: await Responses.enter_no_topic(query) })

    await leave(user, { ...options, response: await Responses.leave_with_topic(topic) })

    await Queue.enqueue('saved_insight', { topic_id: topic.id, user_id: user.id, direction: 'next' })

  })
}


let leave = async (user, options = {}) => {
  await protect(Command('Leave', user.id), async () => {

    await user.setState({ context: null })

    if (options.response)
      await user.reply(options.response, { reply_markup: { hide_keyboard: true } })

  })
}


export default {
  perform
}
