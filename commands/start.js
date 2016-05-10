import Setup from '../execution_chains/setup'

import {
  humanizeTopics
} from '../utils'

let perform = async (user, payload) => {
  if (await user.isInitialized()) {

    let { subscribedTopics } = await user.topics()
    await user.reply(`I am fully operational now. I will give you advice on ${humanizeTopics(subscribedTopics)} from ${user.state.start_time} till ${user.state.finish_time}. You can always change this in /settings.`)

  } else {
    await user.reply(`Hello, meatb…, Master. I am your MentorBot, here to give you actionable startup advice.`)
    return await Setup.next(user)
  }
}

export default {
  perform
}
