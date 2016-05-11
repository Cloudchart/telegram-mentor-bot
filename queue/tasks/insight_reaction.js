import chalk from 'chalk'
import User from '../../user'

import { sleep } from '../../utils'

import {
  insightResponse
} from './utils'


let forceReplyMarkup = (rate) => ({
  inline_keyboard: [[
    { text: rate === 1 ? '👍' : '👎', callback_data: rate === 1 ? 'like' : 'dislike' },
    { text: `More`, callback_data: 'next' }
  ]],
  disable_web_page_preview: rate === -1
})

let scheduleReplyMarkup = (rate) => ({
  inline_keyboard: [[
    { text: rate === 1 ? '👍' : '👎', callback_data: rate === 1 ? 'like' : 'dislike' },
  ]]
})


const FirstTimeResponses = {
  'positive': `👌Got it, Master. I will remind you of this advice later, and will be sending more like this.`,
  'negative': `Every time you skip an advice, God k… oh wait, wrong line. I learn from your reactions and will send you less advice like those you skip.`
}


let perform = async (job, done) => {

  let {
    user_id,
    message_id,
    message_text,
    message_entities,
    callback_query_id,
    rate,
  } = job.data

  try {

    let user = await User({ id: user_id })
    let insights = { ...user.state.insights }
    let mutationPayload = insights[message_id]

    if (!mutationPayload) {
      user.answerCallbackQuery(callback_query_id, `Something went wrong, Master!`)
      return done()
    }

    if (mutationPayload.rate) {
      user.answerCallbackQuery(callback_query_id, `You've already rated this insight, Master!`)
      return done()
    }

    let { topic_id, insight_id, type } = mutationPayload

    await user.mutate(
      rate == 1 ? 'likeInsightInTopic' : 'dislikeInsightInTopic', {
        topic_id,
        insight_id,
      }
    )

    insights[message_id].rate = rate

    await user.setState({ insights })

    let replyMarkup = { inline_keyboard: [] }

    let insight = await user.query('Insight', { id: insight_id }).then(({ node }) => node)

    let text = `${ insightResponse(insight) }${ rate == 1 ? '👍' : '👎' }`

    await user.editMessageText(message_id, text, replyMarkup)

    let rateKind = rate == 1 ? 'positive' : 'negative'
    let rateKey = rateKind + '_rate_sent'
    let delay = 0

    if (!user.state[rateKey]) {
      await user.setState({ [rateKey]: true })
      await user.reply(FirstTimeResponses[rateKind])
      delay = 2 * 1000
    }

    switch (type) {
      case 'schedule':
        await Queue.enqueue('scheduled_insight', { user_id, __delay: delay })
        break
      case 'force':
        let limit = user.state.forced_insight || {}

        if (limit.count == 0 && limit.response) {
          await user.reply(limit.response, { reply_markup: { hide_keyboard: true } })
        }

        await Queue.enqueue('insight', { user_id, topic_id, type, __delay: delay })
        break
    }

  } catch (error) {
    console.log(JSON.stringify(error))
    console.error(chalk.green('Queue::InsightReaction'), chalk.red(error))
  }

  done()
}

export default {
  perform
}

import Queue from '../../queue'
