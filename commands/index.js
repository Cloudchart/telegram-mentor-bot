import start from './start'
import advice from './advice'
import subscribe from './subscribe'
import unsubscribe from './unsubscribe'
import start_time from './start_time'
import finish_time from './finish_time'
import local_time from './local_time'

export default {
  '/start': start,

  '/advice': advice,
  'advice': advice,

  'subscribe': subscribe,
  '/subscribe': subscribe,

  'unsubscribe': unsubscribe,
  '/unsubscribe': unsubscribe,

  'start_time': start_time,

  'finish_time': finish_time,

  'local_time': local_time,
  '/local_time': local_time,
}
