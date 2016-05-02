import chalk from 'chalk'
import User from '../../user'

import {
  insightResponse,
  insightMarkup,
} from './utils'


let perform = async (job, done) => {

  try {

    let { user_id } = job.data
    let user = await User({ id: user_id })

    let insightEdge = await user.query('SubscribedInsight').then(({viewer}) => viewer.insights.edges[0])

    if (!insightEdge) {
      await user.reply(`That is all for now, Master!`)
      return done()
    }

    let message = await user.reply(
      insightResponse(insightEdge.node),
      insightMarkup()
    )

    let insights = { ...user.state.insights }
    insights[message.message_id] = {
      insight_id: insightEdge.node.id,
      topic_id: insightEdge.topic.id,
      type: 'schedule'
    }
    user.setState({ insights })

  } catch (error) {
    console.error(chalk.green('Queue::ScheduledInsight'), chalk.red(error))
  }

  done()

}


export default {
  perform
}
