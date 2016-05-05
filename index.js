import 'dotenv/config'

import bot from './bot'
import Mentor from './mentor'
import User from './user'
import Queue from './queue'
import { dispatch } from './dispatcher'

import './telegram-bot'

let lastUpdateId  = 0


let getUpdates = () => {
  console.log('fetching updates...')
  bot
    .getUpdates({ offset: lastUpdateId, limit: 1, timeout: 60 })
    .then(updates => {
      updates.forEach(update => {
        switch (update.type) {
          case 'message':
            dispatch({ actionType: 'telegram-message', payload: update.value })
            User(update.value.from).then(user => user.handleMessage(update.value))
            break;
          case 'callback_query':
            dispatch({ actionType: 'telegram-callback-query', payload: update.value })
            User(update.value.from).then(user => user.handleCallbackQuery(update.value))
            break;
        }
        lastUpdateId = Math.max(lastUpdateId, update.id + 1)
      })
      return getUpdates()
    })
    .catch((error) => {
      console.log(error)
      return getUpdates()
    } )
}

Queue.start()

getUpdates()
