import Dispatcher from '../dispatcher'
import UserStore from './user_store'
import ChatStore from './chat_store'


let buildExecutionContext = ({ from, chat }) => {
}


Dispatcher.register(async ({ actionType, payload }) => {

  switch (actionType) {

    case ('telegram-message'):
      await buildExecutionContext({ from: payload.from, chat: payload.chat })
      break

    case ('telegram-callback-query'):
      await buildExecutionContext({ from: payload.from, chat: payload.message.chat })
      break

  }

})
