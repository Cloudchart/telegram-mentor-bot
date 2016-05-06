import chalk from 'chalk'
import User from '../../user'

import {
  insightResponse,
  insightMarkup,
} from './utils'


let perform = async (job, done) => {
  let { user_id, topic_id, type } = job.data

  try {

    let user = await User({ id: user_id })

    let limit = user.state.forced_insight || { count: 0 }

    if (limit.topic_id != topic_id || limit.count <= 0)
      return done()

    await user.setState({
      forced_insight: {
        topic_id: limit.topic_id,
        count: limit.count - 1,
        response: limit.response,
      }
    })


    let insight = await user.adviceForTopic(topic_id)

    let message = await user.reply(insightResponse(insight), insightMarkup())

    let insights = { ...user.state.insights }
    insights[message.message_id] = {
      user_id: user_id,
      insight_id: insight.id,
      topic_id,
      type
    }
    await user.setState({ insights })

    await user.mutate('postponeInsightInTopic', {
      insight_id: insight.id,
      topic_id
    })


  } catch (error) {
    console.error(chalk.green('Queue::Insight'), chalk.red(error))
  }

  done()
}

export default {
  perform
}
