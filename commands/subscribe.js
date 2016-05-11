import Immutable from 'immutable'
import Redis from 'ioredis'
import chalk from 'chalk'
import Queue from '../queue'
import ExecutionChains from '../execution_chains'

import {
  humanizeTopics
} from './utils'


let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })

let setInitialSubscribeValue = async (id, value) =>
  await redis.hset(`:user:${id}:subscribe`, 'value', value)

let hasInitialSubscribeValue = async (id) =>
  !!(await redis.hget(`:user:${id}:subscribe`, 'value'))


const Responses = Immutable.fromJS({

  'enter': {
    'no-value': () => `Pick the topics of your choice, Master.`,
    'already-subscribed': (user, topic) => `You have already subscribed to *${topic.name}*, Master.`,
    'not-found': (user, value) => `Sorry, Master, I can’t mentor you on that topic yet. I will inform you when it is uploaded.`,
    'loop': (user) => `Pick the topics of your choice, Master.`,
  },

  'perform': {
    'subscribed': (user, value) => `Excellent choice for a human. You are now subscribed to *${value.name}*. ${value.description || ''}`
  },

  'leave': {
    'no-slots': () => `Learning requires focus. Since you humans aren’t equipped with laser pointing system like I am, a limit of 3 topics will be helpful.`,
    'already-subscribed': (user, topic) => `You have already subscribed to *${topic.name}*, Master.`,
    'done': async (user) => {
      let { subscribedTopics } = await user.topics()
      return `Now you are subscribed to ${humanizeTopics(subscribedTopics)}. You can always /unsubscribe later.`
    }
  }

})


let getResponse = async (name, user, value, options) => {
  let path = name.split(':')
  let chain = user.state.execution_chain && ExecutionChains[user.state.execution_chain]
  let response = chain && chain.overrides.getIn(['subscribe'].concat(path)) || Responses.getIn(path)
  if (typeof response === 'function')
    response = await response(user, value, options)
  return response
}


let resolve = async (user, value, options = {}) => {
  if (user.state.context !== 'subscribe')
    setInitialSubscribeValue(user.id, value)

  options.hasInitialSubscribeValue = await hasInitialSubscribeValue(user.id)

  let query = (value || '').toLowerCase()
  let { availableSlotsCount, availableTopics, subscribedTopics } = await user.topics()
  let subscribedTopic = subscribedTopics.find(topic => topic.name.toLowerCase() === query)
  let availableTopic = availableTopics.find(topic => topic.name.toLowerCase() === query)

  // No available slots
  if (availableSlotsCount === 0)
    return [{
      command: leave,
      response: await getResponse('leave:no-slots', user, value, options)
    }]

  // No value
  if (!value)
    return [{
      command: enter,
      response: await getResponse('enter:no-value', user, value, options)
    }]

  // Already subscribed
  if (subscribedTopic)
    return [{
      command: hasInitialSubscribeValue ? leave : enter,
      response: await getResponse(`${hasInitialSubscribeValue ? 'leave' : 'enter'}:already-subscribed`, user, subscribedTopic, options)
    }]

  // Cancelled by user
  if (query === 'done' && subscribedTopics.length > 0)
    return [{
      command: leave,
      response: await getResponse('leave:done', user, value, options)
    }]

  // Topic not found
  if (!availableTopic)
    return [{
      command: enter,
      response: await getResponse('enter:not-found', user, value, options)
    }]

  let steps = []

  // Subscribe user on topic
  await user.mutate('subscribeOnTopic', { topic_id: availableTopic.id })

  let topics = await user.topics(true)

  // Confirm subscription
  steps.push({
    command: respond,
    response: await getResponse('perform:subscribed', user, availableTopic, options)
  })

  if (options.hasInitialSubscribeValue || topics.availableSlotsCount === 0)
    // Leave
    steps.push({
      command: leave,
      response: await getResponse('leave:done', user, availableTopic, options)
    })
  else
    // Subscribe to another topic
    steps.push({
      command: enter,
      response: await getResponse('enter:loop', user, availableTopic, options)
    })

  return steps
}


let topicsKeyboard = (topics) => {
  let availableTopics = topics.availableTopics.map(topic => [topic.name])
  let done = topics.subscribedTopics.length > 0 ? [['Done']] : []
  return done.concat(availableTopics)
}


// Respond
//
let respond = async (user, options, reply_markup) => {
  if (options.response)
    await user.reply(options.response, { reply_markup })
}


// Enter
//
let enter = async (user, options = {}) => {
  console.log(chalk.green('Commands::Subscribe::Enter'), chalk.blue(user.id))

  try {

    // Set execution context
    await user.setState({ context: 'subscribe' })

    // Respond to user
    await respond(user, options, {
      keyboard: topicsKeyboard(await user.topics()),
      one_time_keyboard: true,
      resize_keyboard: true,
    })

  } catch (error) {

    console.log(chalk.green('Commands::Subscribe::Enter'), chalk.red(error))

  }
}


// Perform
//
let perform = async (user, value, options = {}) => {
  console.log(chalk.green('Commands::Subscribe::Perform'), chalk.blue(user.id), chalk.yellow(value || ''))

  try {

    let steps = await resolve(user, value, options)

    for (let { command, response } of steps)
      await command(user, { ...options, response })

  } catch (error) {

    console.log(JSON.stringify(error))
    console.log(chalk.green('Commands::Subscribe::Perform'), chalk.red(error))

  }

}


// Leave
//
let leave = async (user, options = {}) => {
  console.log(chalk.green('Commands::Subscribe::Leave'), chalk.blue(user.id))

  try {

    // Cleanup context variable
    await setInitialSubscribeValue(user.id, null)

    // Cleanup execution context
    await user.setState({ context: null })

    // Respond to user
    await respond(user, options, { reply_markup: { hide_keyboard: true } })

    // If there is execution chain, let it handle user communications
    if (user.state.execution_chain)
      return await ExecutionChains[user.state.execution_chain].next(user, 'subscribe')

    await Queue.refresh(user)

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
