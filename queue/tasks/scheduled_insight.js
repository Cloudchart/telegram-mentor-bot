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
      if (!user.state.schedule_done_sent) {
        user.setState({ ...user.state, schedule_done_sent: true })
        await user.reply(`That is all for now, Master!`)
      }
      return done()
    }

    user.setState({ ...user.state, schedule_done_sent: false })

    await user.mutate('postponeInsightInTopic', {
      insight_id: insightEdge.node.id,
      topic_id: insightEdge.topic.id
    })

    let message = await user.reply(
      insightResponse(insightEdge.node),
      insightMarkup()
    )

    let insights = { ...user.state.insights }
    insights[message.message_id] = {
      user_id: user_id,
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
