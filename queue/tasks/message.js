import moment from 'moment'
import chalk from 'chalk'

import {
  User
} from '../../storage'

import { sleep } from '../../utils'


let promises = {}


let prepareExecutionContext = async (message) => {
  // Get User
  //
  let user = await User.fetch(message.from) // message.from

  console.log(user)

  // Get Chat
  //
  let chat = null // message.chat

  return { user, chat }
}


let perform = async (job, done) => {
  try {

    let previousPromise = promises[job.data.from.id]

    let promise = new Promise(async (resolve, reject) => {
      await previousPromise
      let executionContext = await prepareExecutionContext(job.data)
      console.log(chalk.blue(moment.utc().format()), chalk.green('Job::Message'), chalk.blue('Perform'), chalk.red(job.data.from.id), chalk.yellow(job.data.text))
      await sleep(5000)
      console.log(chalk.blue(moment.utc().format()), chalk.green('Job::Message'), chalk.blue('Leave'), chalk.red(job.data.from.id), chalk.yellow(job.data.text))
      resolve()
    })

    promises[job.data.from.id] = promise

  } catch(error) {

    console.error(chalk.green('Job::Message'), chalk.red(error))

  } finally {

    done()

  }
}


export default {
  parallel: 1,
  perform
}
