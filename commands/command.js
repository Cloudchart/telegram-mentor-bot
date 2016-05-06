import chalk from 'chalk'

let protect = async (name, fn, cb) => {
  try {
    return await fn()
  } catch (error) {
    console.error(chalk.green(`Command::Name`), chalk.red(error))
  } finally {
    if (typeof cb === 'function') cb()
  }
}

let undefinedMethodError = (name, methodName) => {
  throw new Error(`${name} method '${methodName}' should be defined in child class.`)
}

const Unknown = Symbol('Unknown')


class Command {

  constructor() {
    if (this.displayName() === Unknown)
      throw new Error(`${this.displayName()} should have static field 'displayName'.`)

    if (this.contextName() === Unknown)
      throw new Error(`${this.displayName()} should have static field 'contextName'.`)
  }

  displayName = () =>
    this._displayName || (this._displayName = this.constructor.displayName || Unknown)

  contextName = () =>
    this._contextName || (this._contextName = this.constructor.contextName || Unknown)

  // Enter
  //
  enter = async (user, options = {}) => {
    protect(this.displayName() + '::Enter', async () => {

    })
  }

  responseForEnter = () =>
    undefinedMethodError(this.displayName(), 'responseForEnter')

  // Perform
  //
  perform = async (user, value, options = {}) => {
    protect(this.displayName() + '::Perform', async () => {
      if (this.shouldEnterFromPerform(user, value, options))
        return await this.enter(user, options)

      if (this.shouldLeaveFromPerform(user, value, options))
        return await this.leave(user, options)

      let { response, reply_markup } = await this.responseForPerform(user, value, options) || {}
      if (response) await user.reply(response, { reply_markup })
    })
  }

  shouldEnterFromPerform = () => false
  shouldLeaveFromPerform = () => false

  responseForPerform = () =>
    undefinedMethodError(this.displayName(), 'responseForPerform')

  // Leave
  //
  leave = async (user, options = {}) => {
    return protect(this.displayName() + '::Leave', async () => {
      return await this.resultFromLeave(user)
    })
  }

  resultFromLeave = () => null

  responseForLeave = () =>
    undefinedMethodError(this.displayName(), 'responseForLeave')

}

export default Command
