import mentor from '../mentor'


let users = {}


class User {

  constructor(id) {
    this.id = id

    this.state = null
    this._mentor = mentor(this.id)
    this._stateKey = `:user:${this.id}`
  }

  _ensureUser = async () => {

  }

  _ensureState = async () => {

  }

}


export default async function(id) {
  let user = users[id] || (users[id] = new User(id))

  await user._ensureUser()
  await user._ensureState()
  await user._ensureViewer()

  return user
}
