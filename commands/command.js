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
    console.log(chalk.green(this.displayName() + '::Enter'), chalk.blue(user.id))

    return protect(this.displayName() + '::Enter', async () => {

      await user.setState({ context: this.contextName() })

      await this.sideEffectsInEnter(user, options)

      let { response, reply_markup } = await this.responseForEnter(user, options) || {}
      if (response) await user.reply(response, { reply_markup })

    })
  }

  responseForEnter = () =>
    undefinedMethodError(this.displayName(), 'responseForEnter')

  sideEffectsInEnter = () => null

  // Perform
  //
  perform = async (user, value, options = {}) => {
    console.log(chalk.green(this.displayName() + '::Perform'), chalk.blue(user.id), chalk.yellow(value || ''))

    return protect(this.displayName() + '::Perform', async () => {
      await this.sideEffectsInPerform(user, value, options)

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

  sideEffectsInPerform = () => null

  // Leave
  //
  leave = async (user, options = {}) => {
    console.log(chalk.green(this.displayName() + '::Leave'), chalk.blue(user.id))

    return protect(this.displayName() + '::Leave', async () => {

      await user.setState({ context: null })

      let { response, reply_markup } = await this.responseForLeave(user, options) || {}
      if (response) await user.reply(response, { reply_markup })

      await this.sideEffectsInLeave(user, options)

      return await this.resultFromLeave(user)

    })
  }

  responseForLeave = () =>
    undefinedMethodError(this.displayName(), 'responseForLeave')

  sideEffectsInLeave = () => null

  resultFromLeave = () => null

}

export default Command
