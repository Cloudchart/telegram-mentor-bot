import chalk from 'chalk'
import Queue from '../queue'

const Command = (name) => chalk.green(`Commands::Unsubscribe::${name}`)
const Context = 'unsubscribe'


const Responses = {

  enter: {
    no_topics: async (user) => {
      return `
        There is nothing to unsubscribe you from.
        Try /subscribe first.
      `
    },

    normal: async (user) => {
      let topics = await user.topics()
      return `
        You've subscribed on ${humanizeTopics(topics.subscribedTopics)}.
        Select topics to unsubscribe.
      `
    }
  },

  perform: {
    not_found: async (user, topic) => {
      return `
        I can't unsubscribe you from *${topic}*, try another one, Master.
      `
    },

    normal: async (user) => {
      let topics = await user.topics()
      return `
        You've subscribed on ${humanizeTopics(topics.subscribedTopics)}.
        Select another topic to unsubscribe.
      `
    }
  },

  leave: {

    no_topics: async (user) => {
      return `
        You have unsubscribed from all topics.
        /subscribe to some topics.
      `
    },

    normal: async (user) => {
      let topics = await user.topics()
      return `
        You've subscribed to ${humanizeTopics(topics.subscribedTopics)}.
        You can always /unsubscribe or /subscribe to other topics.
      `
    }

  }

}


let topicsKeyboard = (topics) => {
  return [['Done']].concat(topics.map(topic => [topic.name]))
}


let humanizeTopics = (topics) => {
  let names = topics.map(topic => `*${topic.name}*`)
  let head = names.slice(0, topics.length - 1).join(', ')
  let tail = names[names.length - 1]
  return [head, tail].join(' and ')
}


// Enter
//
let enter = async (user, options = {}) => {
  console.log(Command('Enter'), chalk.blue(user.id))
  await user.setState({ context: Context })
  if (options.silent) return

  try {

    let topics = await user.topics()

    // No subscribed topics
    //
    if (topics.subscribedTopics.length == 0) {
      await user.reply(await Responses.enter.no_topics(user), {
        reply_markup: { hide_keyboard: true }
      })
      return await leave(user, { silent: true })
    }

    // Reply with topics list
    //
    await user.reply(await Responses.enter.normal(user), {
      reply_markup: {
        keyboard: topicsKeyboard(topics.subscribedTopics),
        one_time_keyboard: true,
        resize_keyboard: true,
      }
    })

  } catch(error) {
    console.log(Command('Enter'), chalk.red(error))
  }
}

// Perform
//
let perform = async (user, value) => {
  console.log(Command('Perform'), chalk.blue(user.id))

  try {

    if (user.state.context != Context && !value)
      return await enter(user)

    let query = value.toLowerCase()
    if (query == 'done') {
      return await leave(user)
    }

    let topics = await user.topics()
    let topic = topics.subscribedTopics.find(topic => topic.name.toLowerCase() == query)

    // Topic not found
    //
    if (!topic) {
      await user.reply(await Responses.perform.not_found(user, value), {
        reply_markup: {
          keyboard: topicsKeyboard(topics.subscribedTopics),
          one_time_keyboard: true,
          resize_keyboard: true,
        }
      })
      return await enter(user, { silent: true })
    }

    // Unsubscribe
    //
    await user.mutate('unsubscribeFromTopic', { topic_id: topic.id }).catch(console.log)
    topics = await user.topics(true)

    if (topics.subscribedTopics.length == 0)
      return await leave(user)

      await user.reply(await Responses.perform.normal(user), {
        reply_markup: {
          keyboard: topicsKeyboard(topics.subscribedTopics),
          one_time_keyboard: true,
          resize_keyboard: true,
        }
      })

      return await enter(user, { silent: true })

  } catch(error) {
    console.log(Command('Perform'), chalk.red(error))
  }
}

// Leave
//
let leave = async (user, options = {}) => {
  console.log(Command('Leave'), chalk.blue(user.id))
  await user.setState({ context: null })
  if (options.silent) return

  try {

    let topics = await user.topics()

    if (topics.subscribedTopics.length == 0) {
      await user.reply(await Responses.leave.no_topics(user), {
        reply_markup: { hide_keyboard: true }
      })
    } else {
      await user.reply(await Responses.leave.normal(user), {
        reply_markup: { hide_keyboard: true }
      })
    }

    await Queue.refresh(user)

  } catch(error) {
    console.log(Command('Leave'), chalk.red(error))
  }
}


export default {
  perform
}
