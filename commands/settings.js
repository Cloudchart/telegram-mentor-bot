import {
  humanizeTopics,
  timeZoneFromUTC,
} from '../utils'

const Response = async (user) => {
  let { subscribedTopics } = await user.topics()
  let { start_time, finish_time, utc_offset } = user.state
  return `
    I am mentoring you on ${humanizeTopics(subscribedTopics)} from *${start_time}* till *${finish_time}*, and your timezone is *${timeZoneFromUTC(utc_offset)}*.
    You can change /time, /subscribe or /unsubscribe from topics.
  `
}


let perform = async (user) => {
  await user.reply(await Response(user))
}


export default {
  perform
}
