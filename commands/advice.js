import moment from 'moment'
import Queue from '../queue'

import { sample, sleep } from '../utils'

let topicsKeyboard = async (user) => ({
  keyboard: await user.topics().then(({ defaultTopics }) => defaultTopics.map(topic => [topic.name])),
  one_time_keyboard: true
})

const Responses = [
  [`Here you go, Master:`, `I hope you put them to good use.`],
  [`As you wish, Master:`, `Now put this to work!`],
  [`Ready and served:`, `Use this wisely.`],
  [`Here you go, Master:`, `Do try this at home. And at work as well.`],
  [`As you please, meatb…Master:`, `Now practice time!`],
]


// Enter
//
let enter = async (user, options = {}) => {
  await user.setState({ context: 'advice' })

  await user.reply(options.response || 'What is the topic of your interest, Master?', {
    reply_markup: await topicsKeyboard(user)
  })
}


// Perform
//
let perform = async (user, value) => {

  try {

    if (user.state.context !== 'advice' && !value)
      return await enter(user)

    let query = value.toLowerCase()
    let topic = await user.topics()
      .then(({ defaultTopics }) => defaultTopics.find(topic => topic.name.toLowerCase() === query))

    // Restart advice loop
    //
    if (!topic)
      return await enter(user, {
        response: `I don't have topic *${value}*. Try again, Master.`
      })

    let [enterResponse, leaveResponse] = sample(Responses)

    await user.setState({
      forced_insight: {
        topic_id: topic.id,
        count: 3,
        response: leaveResponse
      }
    })

    await user.reply(enterResponse, { reply_markup: { hide_keyboard: true } })

    Queue.enqueue('insight', {
      user_id: user.id,
      topic_id: topic.id,
      type: 'force'
    })

    // Leave action
    //
    await leave(user)

  } catch (error) {
    console.log(error)
  }


}


// Leave
//
let leave = async (user) => {
  await user.setState({ context: null })
}


// Exports
//
export default {
  perform
}
