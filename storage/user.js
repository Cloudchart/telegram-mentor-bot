import Immutable from 'immutable'

import mentor from '../mentor'
import redis from '../redis'

let users = {}


class User {

  constructor(id) {
    this.id = id
  }

  setState = (nextState) => {
    this.state = this.state.merge(nextState)
  }

  _readState = async () => {
    let storedState = await redis.hgetall(`:user:${this.id}`)

    for (let key in storedState) {
      let value = storedState[key]
      try { value = JSON.parse(value) } catch(error) {}
      storedState[key] = value
    }

    this.state = Immutable.fromJS(storedState)
  }

  _saveState = async () => {
    await redis.hsetall(`:user:${this.id}`, this.state.toJS())
  }


}


let fetch = async ({ id }) => {
  let user = users[id] || (users[id] = new User(id))
  await user._readState()
  // ensure viewer
  // ensure topics
  return user
}


export default {
  fetch
}
