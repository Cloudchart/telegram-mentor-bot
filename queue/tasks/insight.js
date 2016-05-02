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
    let insight = await user.adviceForTopic(topic_id)

    let message = await user.reply(
      insightResponse(insight),
      insightMarkup()
    )

    let insights = { ...user.state.insights }
    insights[message.message_id] = {
      insight_id: insight.id,
      topic_id,
      type
    }
    user.setState({ insights })

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
