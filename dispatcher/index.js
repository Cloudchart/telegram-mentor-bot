import {
  Dispatcher
} from 'flux'

let instance = new Dispatcher()

export default instance

export const dispatch = instance.dispatch.bind(instance)
