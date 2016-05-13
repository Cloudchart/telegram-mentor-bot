import moment from 'moment'
import Redis from '../../redis'
import User from '../../user'

import {
  insightResponse,
  savedInsightMarkup,
} from './utils'


let perform = async (job, done) => {
  try {

    let { user_id, topic_id, message_id, direction, cursor } = job.data

    let before = null
    let after = null
    let first = null
    let last = null

    if (direction == 'next') {
      after = cursor
      first = 1
    }

    if (direction == 'back') {
      before = cursor
      last = 1
    }

    let user = await User({ id: user_id })

    let { pageInfo, edges } = await user.query('SavedInsight', { id: job.data.topic_id, first, last, before, after }).then(({ node }) => node.insights )

    console.log(pageInfo, edges)

    let message = { message_id }

    if (!message_id)
      message = await user.reply(insightResponse(edges[0].node), savedInsightMarkup(pageInfo))
    else
      await user.editMessageText(message_id, insightResponse(edges[0].node), savedInsightMarkup(pageInfo).reply_markup)


    await Redis.hmset(`:messages:${message.message_id}`, {
      topic_id: job.data.topic_id,
      user_id: job.data.user_id,
      type: 'saved-insight',
      cursor: edges[0].cursor,
      updated_at: + moment.utc()
    })

  } catch(error) { console.log('error:', error, JSON.stringify(error, null, 2)) } finally { done() }
}


export default {
  perform
}
