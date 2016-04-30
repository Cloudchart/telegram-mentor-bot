import Queue from '../queue'


let nextInsight = async (user, callbackQuery) => {
  let payload = user.state.insights[callbackQuery.message.message_id]

  if (!payload)
    return user.answerCallbackQuery(callbackQuery.id, `Something went wrong, Master!`)

  await user.answerCallbackQuery(callbackQuery.id)

  Queue.enqueue('insight', {
    user_id: user.id,
    topic_id: payload.topic_id,
    type: 'force'
  })
}


let rateInsight = async (user, callbackQuery, rate) => {

  Queue.enqueue('insight_reaction', {
    user_id: user.id,
    message_id: callbackQuery.message.message_id,
    callback_query_id: callbackQuery.id,
    rate: rate
  })

}


export const NextInsightForTopic = {
  perform: (user, callbackQuery) => nextInsight(user, callbackQuery)
}


export const LikeInsightInTopic = {
  perform: (user, callbackQuery) => rateInsight(user, callbackQuery, 1)
}


export const DislikeInsightInTopic = {
  perform: (user, callbackQuery) => rateInsight(user, callbackQuery, -1)
}
