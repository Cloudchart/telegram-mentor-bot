import moment from 'moment'

const MessageDelay = 1000

export let sleep = (time) =>
  new Promise((done, fail) => setTimeout(done, Math.max(time, 0)))


export let sleepForUser = async (last_message_sent_at = 0) => {
  let now = + moment.utc()
  let delay = MessageDelay - (now - (last_message_sent_at || 0))
  await sleep(delay)
}
