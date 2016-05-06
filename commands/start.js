import SubscribeCommand from './subscribe'
import StartTimeCommand from './start_time'
import FinishTimeCommand from './finish_time'
import LocalTimeCommand from './local_time'

const GreetingNotSetUp = `
Hello, meatb…, Master. I am your MentorBot, here to give you actionable startup advice.
`

const GreetingSetUp = `
At your command, Master.
`

const SomethingWentWrong = `
Something went wrong, Master.
`

const Commands = {
  'subscribe': SubscribeCommand,
  'start_time': StartTimeCommand,
  'finish_time': FinishTimeCommand,
  'local_time': LocalTimeCommand,
}

let perform = async (user, payload) => {
  if (user.state.initialized === true)
    return await user.reply(GreetingSetUp)

  await user.reply(GreetingNotSetUp)

  if (!user.state.context)
    await user.setState({ context: 'subscribe' })

  if (Commands[user.state.context])
    return await Commands[user.state.context].enter(user)

  await user.reply(SomethingWentWrong)
}

export default {
  perform
}
