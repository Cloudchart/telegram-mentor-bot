import moment from 'moment'
import Queue from '../queue'

let topicsKeyboard = async (user) => ({
  keyboard: await user.topics().then(({ defaultTopics }) => defaultTopics.map(topic => [topic.name])),
  one_time_keyboard: true
})

// Enter
//
let enter = async (user, options = {}) => {
  user.setState({ context: 'advice' })

  await user.reply(options.response || 'What is the topic of your interest, Master?', {
    reply_markup: await topicsKeyboard(user)
  })
}


// Perform
//
let perform = async (user, value) => {
  if (user.state.context !== 'advice' && !value)
    return enter(user)

  let query = value.toLowerCase()
  let topic = await user.topics()
    .then(({ defaultTopics }) => defaultTopics.find(topic => topic.name.toLowerCase() === query))

  // Restart advice loop
  //
  if (!topic)
    return enter(user, {
      response: `I don't have topic *${value}*. Try again, Master.`
    })

  Queue.enqueue('insight', {
    user_id: user.id,
    topic_id: topic.id,
    type: 'force'
  })

  // Leave action
  //
  await leave(user)

}


// Leave
//
let leave = async (user) => {
  user.setState({ context: null })
}


// Exports
//
export default {
  perform
}
