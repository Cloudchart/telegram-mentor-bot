import moment from 'moment'
import chalk from 'chalk'
import User from '../../user'


let insightOriginResponse = ({ author, title, url, duration }) => {
  let humanizedDuration = moment.duration(duration, 'seconds').humanize() + ' read'
  let humanizedOrigin = [author, title, humanizedDuration].filter(i => !!i).join(', ')
  return `
    [${humanizedOrigin}](${url.trim()})
  `
}


let insightResponse = ({ content, origin }) => {
  return `
    ${content}
    ${insightOriginResponse(origin)}
  `
}

let insightMarkup = () => ({
  reply_markup: {
    inline_keyboard: [[
      { text: 'Dislike', callback_data: 'dislike' },
      { text: 'Like', callback_data: 'like' }
    ]]
  },
  hide_keyboard: true,
  disable_web_page_preview: true,
})


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
