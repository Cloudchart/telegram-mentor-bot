import chalk from 'chalk'
import User from '../../user'


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


let perform = async (job, done) => {

  let {
    user_id,
    message_id,
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

    user.setState({ insights })

    let replyMarkup = type === 'schedule'
      ? scheduleReplyMarkup(rate)
      : forceReplyMarkup(rate)

    await user.updateMessageReplyMarkup(message_id, replyMarkup)

    if (type === 'schedule')
      await Queue.enqueue('scheduled_insight', {
        user_id
      })

  } catch (error) {
    console.error(chalk.green('Queue::InsightReaction'), chalk.red(error))
  }

  done()
}

export default {
  perform
}

import Queue from '../../queue'
