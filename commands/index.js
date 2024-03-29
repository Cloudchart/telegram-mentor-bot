import start from './start'
import advice from './advice'
import subscribe from './subscribe'
import unsubscribe from './unsubscribe'
import time from './time'
import start_time from './start_time'
import finish_time from './finish_time'
import time_zone from './time_zone'
import local_time from './local_time'
import hello from './hello'
import bullshit from './bullshit'

import help from './help'
import mentor from './mentor'

import restart from './restart'

import settings from './settings'

import saved from './saved'

let commands = {
  '/start': start,

  '/advice': advice,
  'advice': advice,

  'subscribe': subscribe,
  '/subscribe': subscribe,

  'unsubscribe': unsubscribe,
  '/unsubscribe': unsubscribe,

  '/time': time,

  'start_time': start_time,
  '/start_time': start_time,

  'finish_time': finish_time,
  '/finish_time': finish_time,

  'time_zone': time_zone,
  '/time_zone': time_zone,

  'local_time': local_time,
  '/local_time': local_time,

  'hello': hello,

  'bullshit': bullshit,

  '/settings': settings,

  '/help': help,
  'help': help,

  '/saved': saved,
  'saved': saved,
}

// Restart
//
commands[restart.contextName] = restart
commands['/' + restart.contextName] = restart

// Mentor
//
commands[mentor.contextName()] = mentor

// Exports
//
export default commands
