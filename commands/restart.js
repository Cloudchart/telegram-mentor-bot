import Command from './command'
import Queue from '../queue'
import Commands from '../commands'


const ConfirmationMessage = 'YES'

const Responses = {

  enter: `
    Please type *${ConfirmationMessage}* if you want to reset me.
  `
  ,

  leave_success: `
    Reset sequence commencing...
  `,

  leave_failure: `
    Okay, business as usual.
  `

}


let resetUser = async (user) => {
  await user.resetState()
  let topics = await user.topics()
  for (let topic of topics.subscribedTopics)
    await user.mutate('unsubscribeFromTopic', { topic_id: topic.id })
  await user.topics(true)
}


class RestartCommand extends Command {

  static displayName = 'Restart'

  static contextName = 'restart'

  static perform = (...args) => {
    return new RestartCommand().perform(...args)
  }


  shouldEnterFromPerform = (user, value) =>
    user.state.context !== 'restart' && !value


  sideEffectsInPerform = (user, value) =>
    this.answer = value === ConfirmationMessage


  shouldLeaveFromPerform = () =>
    this.answer !== undefined


  responseForEnter = (user, options) => ({
    response: options.response || Responses.enter
  })


  responseForLeave = () => ({
    response: this.answer ? Responses.leave_success : Responses.leave_failure
  })


  sideEffectsInLeave = async (user) => {
    if (!this.answer) return
    await resetUser(user)
    await Queue.refresh(user)
    await Commands['/start'].perform(user)
  }


  resultFromLeave = () =>
    this.answer

}


export default RestartCommand
