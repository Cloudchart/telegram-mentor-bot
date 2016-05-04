import fetch from 'node-fetch'
import querystring from 'querystring'
import Commands from '../commands'

const KnownIntents = {
  'show advice': {
    param:    'mentor_topics',
    command:  'advice'
  }
}


let getIntent = ({ entities }) => {
  let { intent, ...payload } = entities
  if (!intent || intent.length == 0) return null

  intent = KnownIntents[intent[0].value]
  if (!intent) return null

  let param = payload[intent.param][0] && payload[intent.param][0].value

  return { command: intent.command, param }
}


let perform = async (user, query) => {

  let params = querystring.stringify({
    q: query,
    session_id: 'telegram-mentor-bot'
  })

  try {

    let response = await fetch(process.env.WIT_AI_API_URL + '/converse?' + params, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WIT_AI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())

    let intent = getIntent(response)
    if (!intent) return false

    await Commands[intent.command].perform(user, intent.param)

    return true

  } catch(error) {
    console.log(error)
    return false
  }


}


export default {
  perform
}
