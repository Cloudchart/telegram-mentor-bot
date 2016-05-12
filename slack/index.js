import moment from 'moment'
import fetch from 'node-fetch'
import redis from '../redis'


let postNewUser = async ({ id, first_name, last_name, username }) => {
}


let postDailyStats = async () => {
  let ids = await redis.smembers(':users')

  let now = moment.utc()
  let dailyActiveCount = 0

  for (let id of ids) {
    let [
      last_message_received_at,
      last_callback_query_received_at
    ] = await redis.hmget(
      `:user:${id}`,
      'last_message_received_at',
      'last_callback_query_received_at'
    )

    let activeAt = Math.max(parseInt(last_message_received_at || 0), parseInt(last_callback_query_received_at || 0))

    if (activeAt > 0 && now.diff(moment.utc(activeAt), 'hours') < 24)
      dailyActiveCount++
  }

  let text = `
    Hey meatb… everyone, here are some fresh stats from @TheMentorBot:
    Total people: *${ids.length}*
    Active in last day: *${dailyActiveCount}*
  `.trim().replace(/\n[ \t]+/g, '\n')

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })
    .catch(console.error)
}


export default {
  postNewUser,
  postDailyStats,
}
