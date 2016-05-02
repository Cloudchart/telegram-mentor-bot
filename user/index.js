import Redis from 'ioredis'
import bot from '../bot'
import Mentor from '../mentor'
import Commands from '../commands'
import Queries from '../queries'

import {
  getMessageCommand
} from '../utils'


let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })

let users = {}


const UnknownCommandMessage = (command) => `I don't understand *${command.command}* command.`
const SomethingWentWrong = `Something went wrong, Master.`


class User {

  constructor(user) {
    this.id = user.id

    this._user = user
    this._mentor = Mentor(user.id)

    this.state = null
  }

  // State handling
  //
  ensureUser = async () => {
    let users = JSON.parse(await redis.get('users')) || []
    if (users.indexOf(this._user.id) > -1)
      return
    users.push(this._user.id)
    await redis.set('users', JSON.stringify(users))
  }

  ensureState = async () => {
    if (!this.state)
      this.state = await JSON.parse(await redis.get(this._user.id)) || {}
  }

  setState = (nextState) => {
    this.state = { ...this.state, ...nextState }
    redis.set(this._user.id, JSON.stringify(this.state))
    return this.state
  }


  // Handle message
  //
  handleMessage = async (message) => {

    try {
      await this.ensureUser()
      await this.ensureState()
      if (!this.state.chat_id)
        this.setState({ chat_id: message.chat.id })

      let command = getMessageCommand(message)

      if (this.state.context)
        return await this.handleContext(message)

      if (command)
        return await this.handleCommand(command, message)

      if (await this.handleTopic(message.text.trim().toLowerCase()))
        return

      return await this.sendMessage(message, `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`)
    } catch (error) {
      console.log(error)
    }
  }


  // Handle Callback Query
  //
  handleCallbackQuery = async (callbackQuery) => {
    await this.ensureUser()
    await this.ensureState()
    if (!this.state.chat_id)
      this.setState({ chat_id: callbackQuery.message.chat.id })

    let query = callbackQuery.data

    if (Queries[query] && Queries[query].perform)
      return await Queries[query].perform(this, callbackQuery)

    return await this.reply(`I don't know how to do this yet, Master!`)
  }


  // Handle command
  //
  handleCommand = async (command, message) => {
    console.log('handling ', command)
    if (Commands[command.command])
      await Commands[command.command].perform(this, command.payload)
    else
      await this.sendMessage(message, UnknownCommandMessage(command))
  }

  // Handle context
  //
  handleContext = async (message) => {
    if (Commands[this.state.context])
      return await Commands[this.state.context].perform(this, message.text.trim())

    await this.sendMessage(message, SomethingWentWrong)
  }

  handleTopic = async (query) => {
    let topics = await this.topics()
    let topic = topics.defaultTopics.find(topic => topic.name.toLowerCase() === query)
    if (!topic)
      return

    await Commands['advice'].perform(this, query)
    return true
  }


  sendMessage = (message, text, options) =>
    bot.sendMessage(message.chat.id, text.trim().replace(/\n[ \t]+/g, '\n'), {
      parse_mode: 'Markdown',
      ...options
    })


  reply = (text, options) =>
    bot.sendMessage(this.state.chat_id, text.trim().replace(/\n[ \t]+/g, '\n'), {
      parse_mode: 'Markdown',
      ...options
    })


  updateMessageReplyMarkup = (message_id, reply_markup) =>
    bot.updateMessageReplyMarkup(this.state.chat_id, message_id, reply_markup)


  answerCallbackQuery = (callback_query_id, text = null, show_alert = false) => {
    let payload = {
      callback_query_id,
      show_alert,
    }

    if (text) payload.text = text

    return bot._request('answerCallbackQuery', payload)
  }


  viewer = async (force = false) => {
    if (force) this._viewer = null
    if (!this._viewer) {
      this._viewer = await this._mentor.viewer().catch(() => null)
      if (!this._viewer) {
        await this._mentor.createTelegramUser(this._user).catch(console.log)
        this._viewer = await this._mentor.viewer()
      }
    }
    return this._viewer
  }


  topics = async (force = false) => {
    if (force) this._topics = null
    if (!this._topics) {
      let viewer = await this.viewer()
      this._topics = await this._mentor.topics().then(({ availableSlotsCount, edges }) => {
        let data = {}
        data.availableSlotsCount = availableSlotsCount
        data.subscribedTopics = edges.filter(edge => edge.node.isSubscribedByViewer).map(edge => edge.node)
        data.availableTopics = edges.filter(edge => !edge.node.isSubscribedByViewer).map(edge => edge.node)
        data.defaultTopics = edges.map(edge => edge.node)
        return data
      })
    }
    return this._topics
  }

  topic = (topic_id) =>
    this.topics().then(({ defaultTopics }) => defaultTopics.find(topic => topic.id === topic_id))

  subscribe = async (topic) => {
    await this._mentor.subscribeOnTopic(topic.id)
    await this.topics(true)
  }

  unsubscribe = async (topic) => {
    await this._mentor.unsubscribeFromTopic(topic.id)
    await this._topics(true)
  }

  query = (name, variables) => this._mentor.query(name, variables)

  mutate = (name, payload) => this._mentor.mutate(name, payload)

  adviceForTopic = (topic) =>
    this._mentor.adviceForTopic(topic)
      .then(topic => topic.insights.edges[0].node)

}


export default async function(user) {
  let result = users[user.id] || (users[user.id] = new User(user))
  await result.ensureState()
  await result.ensureUser()
  return result
}
