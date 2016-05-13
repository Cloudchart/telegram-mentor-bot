import chalk from 'chalk'
import User from '../../user'

import { sample, sleep } from '../../utils'

import {
  insightResponse,
  insightMarkup,
} from './utils'


const Responses = [
  `That’s all for now, Master.`,
  `That’s enough advice for now. Time to put it to work.`,
  `No more advice for a while. Work now.`,
  `I will have more advice later. Now study these and put them to use.`,
  `Work now, human, More advice later.`,
  `Too much advice is called procrastination.`,
  `Now work to put this advice to use, Master, before I come and take your job.`,
  `I know you can’t wait to put my advice to work, so I will leave you at that.`,
  `More coming soon.`,
  `End of the line. Disembark carefully. Come back soon.`,
  `More advice coming. Keep on learning!`
]

const FirstTimeResponse = ``


let perform = async (job, done) => {

  try {

    let { user_id } = job.data
    let user = await User({ id: user_id })

    let insightEdge = await user.query('SubscribedInsight').then(({viewer}) => viewer.insights.edges[0])

    if (!insightEdge) {
      if (!user.state.schedule_done_sent) {
        await user.setState({ ...user.state, schedule_done_sent: true })
        let response = sample(Responses)

        if (!user.state.first_schedule_done_sent) {
          await user.setState({ first_schedule_done_sent: true })

        }

        await user.reply(response)
      }
      return done()
    }

    await user.setState({ ...user.state, schedule_done_sent: false })

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
    await user.setState({ insights })

  } catch (error) {
    console.error(chalk.green('Queue::ScheduledInsight'), chalk.blue(user.id), chalk.red(error))
  }

  done()

}


export default {
  perform
}
