import chalk from 'chalk'
import StartTimeCommand from './start_time'


const Responses = {

  enter: {
    no_slots: async (user) => {
      let topics = await user.topics()
      return `
        You've already subscribed to ${humanizeTopics(topics.subscribedTopics)}.
        /unsubscribe from some topics first.
      `
    },

    no_topics: async (user) => {
      return `
        Select topics to subscribe.
      `
    },

    normal: async (user) => {
      let topics = await user.topics()
      return `
        You've subscribed to ${humanizeTopics(topics.subscribedTopics)}.
        Select another topic to subscribe.
      `
    },
  },

  perform: {

    no_slots: async (user, topic) => {
      return `
        I can't subscribe you to *${topic}*, you have no subscription slots left.
        Try /unsubscribe first.
      `
    },

    not_found: async (user, topic) => {
      return `
        I can't subscribe you to *${topic}*, try another one, Master.
      `
    },

    normal: async (user, topic) => {
      return `
        You've subscribed to ${ [topic.name, topic.description].filter(part => !!part).join('. ') }.
        Select another topic to subscribe or choose Done.
      `
    },

  },

  leave: {
    no_slots: async (user) => {
      let topics = await user.topics()
      return `
        You've subscribed to ${humanizeTopics(topics.subscribedTopics)}.
        You can always /unsubscribe or /subscribe to other topics.
      `
    },

    no_topics: async (user) => {
      return `
        You have no active subscriptions.
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


let humanizeTopics = (topics) => {
  let names = topics.map(topic => `*${topic.name}*`)
  let head = names.slice(0, topics.length - 1).join(', ')
  let tail = names[names.length - 1]
  return [head, tail].join(' and ')
}


let topicsKeyboard = (topics) => {
  let availableTopics = topics.availableTopics.map(topic => [topic.name])
  let done = topics.subscribedTopics.length > 0 ? [['Done']] : []
  return done.concat(availableTopics)
}


// Enter
//
let enter = async (user, options = {}) => {
  console.log(chalk.green('Commands::Subscribe::Enter'), chalk.blue(user.id))
  user.setState({ context: 'subscribe' })

  try {

    if (options.silent) return

    let topics = await user.topics()

    if (topics.availableSlotsCount == 0) {
      await user.reply(await Responses.enter.no_slots(user), {
        reply_markup: { hide_keyboard: true }
      })
      return await leave(user, { silent: true })
    }

    if (topics.subscribedTopics.length == 0) {
      return await user.reply(await Responses.enter.no_topics(user), {
        reply_markup: {
          keyboard: topicsKeyboard(topics),
          one_time_keyboard: true,
          resize_keyboard: true,
        }
      })
    }

    await user.reply(await Responses.enter.normal(user), {
      reply_markup: {
        keyboard: topicsKeyboard(topics),
        one_time_keyboard: true,
        resize_keyboard: true,
      }
    })

  } catch (error) {
    console.log(chalk.green('Commands::Subscribe::Enter'), chalk.red(error))
  }
}


// Perform
//
let perform = async (user, value) => {
  console.log(chalk.green('Commands::Subscribe::Perform'), chalk.blue(user.id))

  try {

    if (!user.state.context == 'subscribe' || !value)
      return await enter(user)

    let query = value.trim().toLowerCase()


    // Done
    //
    if (query == 'done')
      return await leave(user)


    let topics = await user.topics()


    // No available slots
    //
    if (topics.availableSlotsCount == 0) {
      await user.reply(await Responses.perform.no_slots(user, value), {
        reply_markup: { hide_keyboard: true }
      })
      return await leave(user, { silent: true })
    }


    let topic = topics.availableTopics.find(topic => topic.name.toLowerCase() == query)

    // Topic not found
    //
    if (!topic) {
      await user.reply(await Responses.perform.not_found(user, value), {
        reply_markup: {
          keyboard: topicsKeyboard(topics),
          one_time_keyboard: true,
          resize_keyboard: true,
        }
      })
      return await enter(user, { silent: true })
    }


    // Subscribe
    //
    await user.mutate('subscribeOnTopic', { topic_id: topic.id })
    topics = await user.topics(true)


    // No available slots
    //
    if (topics.availableSlotsCount == 0)
      return await leave(user)


    await user.reply(await Responses.perform.normal(user, topic), {
      reply_markup: {
        keyboard: topicsKeyboard(topics),
        one_time_keyboard: true,
        resize_keyboard: true,
      }
    })

    return await enter(user, { silent: true })


  } catch (error) {
    console.log(chalk.green('Commands::Subscribe::Perform'), chalk.red(error))
  }

}


// Leave
//
let leave = async (user, options = {}) => {
  console.log(chalk.green('Commands::Subscribe::Leave'), chalk.blue(user.id))
  user.setState({ context: null })

  try {

    if (options.silent) return

    let topics = await user.topics()

    if (topics.availableSlotsCount == 0) {
      await user.reply(await Responses.leave.no_slots(user), {
        reply_markup: { hide_keyboard: true }
      })
    } else if (topics.subscribedTopics.length == 0) {
      await user.reply(await Responses.leave.no_topics(user), {
        reply_markup: { hide_keyboard: true }
      })
    } else {
      await user.reply(await Responses.leave.normal(user), {
        reply_markup: { hide_keyboard: true }
      })
    }

    if (!user.state.initialized)
      return await StartTimeCommand.enter(user)

  } catch (error) {
    console.log(chalk.green('Commands::Subscribe::Leave'), chalk.red(error))
  }
}


// Exports
//
export default {
  enter,
  perform,
  leave,
}
