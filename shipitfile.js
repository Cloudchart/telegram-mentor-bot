"use strict"

var path = require('path')

module.exports = function(shipit) {
  require('shipit-deploy')(shipit)
  require('shipit-shared')(shipit)
  require('shipit-npm')(shipit)

  const HOME_PATH = '/home/app/mentor-telegram-bot'

  shipit.initConfig({

    default: {
      shared: {
        overwrite: true,
        files: [
          '.env'
        ],
      },

      bot: {
        uuid: 'mentor-telegram-bot'
      }

    },

    production: {
      servers: 'app@mentor1.cochart.net',
      workspace: '/tmp/mentor-telegram-bot-deploy',
      deployTo: HOME_PATH,
      repositoryUrl: 'git@github.com:Cloudchart/telegram-mentor-bot.git',
      shallowClone: false,
    },

  })

}
