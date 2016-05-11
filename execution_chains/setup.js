import Queue from '../queue'
import ChainBuilder from './chain_builder'

import {
  humanizeTopics,
  timeZoneFromUTC
} from '../utils'


export default ChainBuilder.create({

  name: 'setup',

  commands: ['subscribe', 'start_time', 'finish_time', 'time_zone'],


  overrides: {
    subscribe: {
      enter: {
        'no-value': () => `What topics do you wish to be advised on? You can always change that in my settings.`,
        'not-found': () => `I don’t think I have this topic.`,
      },
      perform: {
        'subscribed': (user, topic) => `Good, you are now subscribed to *${topic.name}*. ${topic.description || ''}`
      },
      leave: {
        'done': async (user) => {
          let { subscribedTopics } = await user.topics()
          return `Excellent choice for a human. Your current topics are: ${humanizeTopics(subscribedTopics)}.`
        }
      }
    }
  },


  responses: {
      to_subscribe: () => `
        Hello, meatb…, Master. I am your MentorBot, here to give you actionable startup advice. What topics do you wish to be advised on? You can always change that in my settings.
      `,

      from_subscribe_to_start_time: () => `
        When should I start giving advice?
      `,

      from_start_time_to_finish_time: () => `
        Will do, Master. And when do you want me to stop?
      `,

      from_finish_time_to_time_zone: () => `
        To make my setup laser-sharp, could you please tell me your local time?
      `,

      from_time_zone: (user) =>
        `You’re doing impressively good for an organic life-form, Master 👏. ` +
        `To get the most out of your mentoring, say /advice if you need advice right away, ` +
        `/time to set advice schedule, /subscribe or /unsubscribe to change your topics 🚀. ` +
        `Don’t forget to press “I’ll use it“ or “Skip“ to make me serve you better advice 🍰.`
  },

  leave: async (user) => {
    await Queue.refresh(user)
  }

})
