import Commands from '../commands'

let knownNames = []

let create = ({ name, commands, responses, leave }) => {

  if (knownNames.indexOf(name) !== -1)
    throw new Error(`Execution Chain ${name} already exists.`)

  if (commands.length < 2)
    throw new Error(`Execution Chain ${name} should contain at least 2 commands. Got ${commands.length}.`)

  for (let responseName in responses)
    if (typeof responses[responseName] !== 'function')
      throw new Error(`Execution Chain ${name} response ${responseName} type should be function. Got ${ typeof responses[responseName] }.`)


  let next = async (user) => {
    await user.setState({ execution_chain: name })

    let commandIndex = commands.indexOf(user.state.context)

    // Leave
    //
    if (commandIndex == commands.length - 1) {
      await user.setState({
        execution_chain: null,
        context: null,
      })

      let response = responses[`from_${commands[commandIndex]}`]
      if (response)
        await user.reply(response(user), { reply_markup: { hide_keyboard: true } })

      if (typeof leave === 'function')
        await leave(user)

      return
    }

    // Proceed to next command
    //
    let response = commandIndex === -1
      ? responses[`to_${commands[commandIndex + 1]}`]
      : responses[`from_${commands[commandIndex]}_to_${commands[commandIndex + 1]}`]

    if (response)
      response = response(user)

    await Commands[commands[commandIndex + 1]].perform(user, null, { response })

  }


  return {
    next
  }

}

export default {
  create
}
