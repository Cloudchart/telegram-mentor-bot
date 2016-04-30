import StartTimeCommand from './start_time'

const Enter = `
What topics do you wish to be advised on? You can always change that in my settings.
`

const Perform = (topic) => `
Subscribed to *${topic.name}*!
`

const PerformError = (value) => `
I can't subscribe you on *${value}*, try another one, Master.
`

const Leave = (topics) => `
${humanizeTopics(topics.subscribedTopics)} — excellent choice for an organic life-form!
`

let humanizeTopics = (topics) => {
  let names = topics.map(topic => `*${topic.name}*`)
  let head = names.slice(0, topics.length - 1).join(', ')
  let tail = names[names.length - 1]
  return [head, tail].join(' and ')
}

let topicsKeyboard = (topics) => {
  let keyboard = topics.availableTopics.map(topic => [topic.name])
  if (topics.subscribedTopics.length > 0)
    keyboard.push(['Done'])
  return keyboard
}


// Enter
//
let enter = async (user) => {
  user.setState({ context: 'subscribe' })

  console.log('Start command enter')
  console.log(user)

  let topics = await user.topics()

  if (topics.availableSlotsCount === 0)
    return leave(user)

  await user.reply(Enter, {
    reply_markup: {
      keyboard: topicsKeyboard(topics),
      one_time_keyboard: true,
    }
  })
}


// Perform
//
let perform = async (user, value) => {

  let query = value.toLowerCase()

  let topics = await user.topics()

  if (query === 'done' && topics.subscribedTopics.length > 0)
    return await leave(user)

  if (topics.availableSlotsCount === 0)
    return await leave(user)

  let topic = topics.availableTopics.find(topic => topic.name.toLowerCase() === query)

  if (!topic)
    return await user.reply(PerformError(value), {
      reply_markup: {
        keyboard: topicsKeyboard(topics),
        one_time_keyboard: true,
      }
    })

  await user.subscribe(topic)

  topics = await user.topics()

  if (topics.availableSlotsCount === 0)
    return await leave(user)

  await user.reply(Perform(topic), {
    reply_markup: {
      keyboard: topicsKeyboard(topics),
      one_time_keyboard: true,
    }
  })
}


// Leave
//
let leave = async (user) => {
  user.setState({ context: null })

  await user.reply(Leave(await user.topics()), {
    reply_markup: { hide_keyboard: true }
  })

  if (!user.state.initialized)
    return await StartTimeCommand.enter(user)
}


// Exports
//
export default {
  enter,
  perform,
  leave,
}
