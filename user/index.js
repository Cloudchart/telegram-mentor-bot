import moment from 'moment'
import Redis from 'ioredis'
import bot from '../bot'
import Mentor from '../mentor'
import Commands from '../commands'
import Queries from '../queries'
import wit from '../wit'

import {
  getMessageCommand,
  sleepForUser
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

    this._stateKey = `:user:${this.id}`
    this.state = null
  }

  isInitialized = () =>
    this.state.initialized === true

  // State handling
  //
  ensureUser = async () => {
    await redis.sadd(':users', this.id)
  }

  ensureState = async () => {
    this.state = {}

    let state = await redis.hgetall(this._stateKey)

    for (let key in state) {
      let value = state[key]
      try { value = JSON.parse(value) } catch(error) {}
      this.state[key] = value
    }

    return this.state
  }

  setState = async (nextState = {}) => {
    let state = {}

    for (let key in nextState)
      state[key] = JSON.stringify(nextState[key])

    await redis.hmset(this._stateKey, state)

    return await this.ensureState()
  }

  resetState = async () => {
    await redis.del(this._stateKey)
    let nextState = { chat_id: this.state.chat_id }
    await this.setState(nextState)
    return await this.ensureState()
  }

  clearBullshit = async () =>
    await this.setState({ bullshit: 0 })


  // Handle message
  //
  handleMessage = async (message) => {

    try {
      await this.ensureUser()
      await this.ensureState()
      if (!this.state.chat_id)
        await this.setState({ chat_id: message.chat.id })

      let command = getMessageCommand(message)

      if (this.state.context) {
        await this.handleContext(message)
        return await this.clearBullshit()
      }

      if (command) {
        await this.handleCommand(command, message)
        return await this.clearBullshit()
      }

      if (await this.handleTopic(message.text.trim().toLowerCase())) {
        return await this.clearBullshit()
      }

      if (await wit.perform(this, message.text.trim())) {
        return await this.clearBullshit()
      }

      await this.setState({
        bullshit: (this.state.bullshit || 0) + 1
      })

      return await Commands['bullshit'].perform(this)

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
      await this.setState({ chat_id: callbackQuery.message.chat.id })

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


  reply = async (text, options) => {
    await sleepForUser(this.state.last_message_sent_at)
    let response = await bot.sendMessage(this.state.chat_id, text.trim().replace(/\n[ \t]+/g, '\n'), {
      parse_mode: 'Markdown',
      ...options
    })
    await this.setState({ last_message_sent_at: + moment.utc() })
    return response
  }


  editMessageText = (message_id, text, reply_markup) =>
    bot.editMessageText(this.state.chat_id, message_id, text.trim().replace(/\n[ \t]+/g, '\n'), reply_markup)

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
        data.subscribedTopics = edges.filter(edge => edge.node.isSubscribedByViewer === true).map(edge => edge.node)
        data.availableTopics = edges.filter(edge => edge.node.isSubscribedByViewer === false).map(edge => edge.node)
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

  unsubscribe = async (topic, options = {}) => {
    await this._mentor.unsubscribeFromTopic(topic.id)
    if (options.lazy != false)
      await this.topics(true)
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
