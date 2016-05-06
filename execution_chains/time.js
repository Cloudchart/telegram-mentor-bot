import ChainBuilder from './chain_builder'
import Queue from '../queue'

import {
  timeZoneFromUTC
} from '../utils'

export default ChainBuilder.create({

  name: 'time',

  commands: ['start_time', 'finish_time', 'time_zone'],

  responses: {
      to_start_time: () => `
        When should I start giving advice?
      `,

      from_start_time_to_finish_time: () => `
        Will do, Master. And when do you want me to stop?
      `,

      from_finish_time_to_time_zone: () => `
        To make my setup laser-sharp, could you please tell me your local time?
      `,

      from_time_zone: (user) =>`
        I will be giving you advice from *${ user.state.start_time }* to *${ user.state.finish_time }*, and your time zone is *${ timeZoneFromUTC(user.state.utc_offset) }*.
      `
  },

  leave: async (user) => {
    console.log('refreshing user')
    await Queue.refresh(user)
  }

})
