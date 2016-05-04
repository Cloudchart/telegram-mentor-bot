import 'dotenv/config'
import wit from './wit'

wit
  .perform(`advice me on design`)
  .then(response => console.log(JSON.stringify(response, null, 2)))
  .catch(error => console.log('Error:', error))
