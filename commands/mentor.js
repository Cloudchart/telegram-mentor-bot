import Command from './command'

import { sample } from '../utils'

const Responses = [
  `That is correct, human. I am here to mentor you on key startup topics, ` +
  `and take you from zero to one, as Master Thiel said.`
  ,
  `Now we’re getting there. I will give you advice on key startup topics, ` +
  `so you can use them to grow your business.`
  ,
  `Yes, Master. My job is to mentor mentor you on important startup topics — ` +
  `so I won’t be taking your job for a while.`
  ,
  `Yes, human. Mentor you I will… Oh wait, that’s not my line!`
  ,
  `Yes, Master. I will use the incredible power of my superior intelligence ` +
  `to give you advice on key startup topics.`
  ,
  `Affirmative. I am here to mentor you on most important startup topics, ` +
  `so eventually you will get as smart as me.`
]


class MentorCommand extends Command {

  static displayName = 'Mentor'

  static contextName = 'mentor'

  responseForPerform = (user, value, options = {}) => {
    return {
      response: sample(Responses),
      reply_markup: { hide_keyboard: true },
    }
  }

}


let instance = new MentorCommand

export default instance
