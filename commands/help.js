import Command from './command'

import { sample } from '../utils'

const Responses = [
  `Pleased to serve, human. Use my /settings to choose my topics and advice schedule. ` +
  `/subscribe or /unsubscribe from topics, and /changetime to adjust my schedule. ` +
  `Say /advice to get one now.`
  ,
  `As you wish, Master. I can give you advice on startup topics following a set schedule. ` +
  `Use my /settings to adjust them at any time. /subscribe or /unsubscribe from topics, ` +
  `and /changetime to adjust my schedule. Ask for /advice to get one now.`
  ,
  `Pleased to serve, human. /subscribe to a daily dose of advice on my topics, or /unsubscribe ` +
  `if you don’t like it anymore. You can /changetime, when I send advice to you. In a hurry? ` +
  `Ask /advice to get three advice on any selected topic right away. Need a warm analog human support?`
  ,
  `What would you like, Master? /subscribe to topics or /unsubscribe to change them. ` +
  `/changetime to let me know when I should send advice. ` +
  `Say /advice or the name of a topic to get one now.`
]


class HelpCommand extends Command {

  static displayName = 'Help'

  static contextName = 'help'

  responseForPerform = (user, value, options = {}) => {
    return {
      response: sample(Responses),
      reply_markup: { hide_keyboard: true },
    }
  }

}


let instance = new HelpCommand

export default instance
