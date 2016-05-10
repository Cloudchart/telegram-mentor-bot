import moment from 'moment'
import chalk from 'chalk'
import Queue from './queue'
import bot from './bot'

let lastUpdateId = 0

const UpdateTypes = [
  { name: 'message',                canHandle: true  },
  { name: 'inline_query',           canHandle: false },
  { name: 'choosen_inline_result',  canHandle: false },
  { name: 'callback_query',         canHandle: false },
]

let loop = async () => {
  console.info(chalk.blue(moment.utc().format()), chalk.green('Core Loop:'), chalk.blue('waiting for updates...'))
  try {
    let updates = await bot.getUpdates({ offset: lastUpdateId, limit: 1, timeout: 60 })
    for (let update of updates) {
      lastUpdateId = Math.max(lastUpdateId, update.id + 1)
      for (let updateType of UpdateTypes) {
        if (!update[updateType.name]) continue
        if (!updateType.canHandle)
          throw new Error(`Cannot handle update of type "${updateType.name}".`)
        await Queue.enqueue(updateType.name, update[updateType.name])
      }
    }
  } catch (error) {
    console.error(chalk.green('Core Loop:'), chalk.red(error))
  } finally {
    await loop()
  }
}

let start = async () => {
  await loop()
}

start()
