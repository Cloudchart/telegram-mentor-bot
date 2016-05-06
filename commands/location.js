import google from '../google'


let locationsKeyboard = (locations = []) => {
  let keyboard = locations.map(location => [location.formatted_address])
  keyboard.push([{ text: 'Give location', request_location: true }])
  return keyboard
}


const Responses = {

  enter: () => `
    To make my setup laser-sharp, could you please tell me your location?
  `,

  perform: () => `
  `,

  perform_error: () => `
  `,

  perform_address_unknown: (address) => `
    I don't know about *${address}*. Can you, please, try again, Master?
  `,

  perform_address_list: () => `
    Here is what I found:
  `,

  leave: () => `
  `

}


// Enter
//
let enter = async (user, message, options = {}) => {
  await user.setState({ context: 'location' })

  if (user.state.location)
    return await leave(user, message)

  await user.sendMessage(message, Responses.enter(), {
    reply_markup: {
      keyboard: locationsKeyboard()
    }
  })
}

let previousLocations = {}

// Perform
//
let perform = async (user, message, value, options = {}) => {
    return message.location
      ? await perform_location_lookup(user, message, message.location, options)
      : await perform_address_lookup(user, message, value, options)
}

// Perform location lookup
//
let perform_location_lookup = async (user, message, location, options = {}) => {
  previousLocations[user.id] = null
}

// Perform address lookup
//
let perform_address_lookup = async (user, message, address, options = {}) => {
  if (previousLocations[user.id]) {
    let location = previousLocations[user.id].find(location => location.formatted_address === address)
    console.log(location)
    previousLocations[user.id] = null
    return
  }

  let locations = await google.location(address).then(json => json.results)

  if (locations.length === 0)
    return await user.sendMessage(message, Responses.perform_address_unknown(address), {
      reply_markup: {
        keyboard: locationsKeyboard()
      }
    })

  previousLocations[user.id] = locations

  return await user.sendMessage(message, Responses.perform_address_list(address), {
    reply_markup: {
      keyboard: locationsKeyboard(locations)
    }
  })

}

// Leave
//
let leave = async (user, message, options = {}) => {

}

// Exports
//
export default {
  enter,
  perform,
  leave
}
