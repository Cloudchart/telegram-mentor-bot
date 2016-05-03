import moment from 'moment'

let settings = {
  start: '20:00',
  finish: '10:00',
  offset: 180
}

let start = moment.utc(settings.start, 'HH:mm').subtract(settings.offset, 'minutes')
let finish = moment.utc(settings.finish, 'HH:mm').subtract(settings.offset, 'minutes')

if (finish.isBefore(start))
  finish.add(1, 'day')

let now = moment.utc('08:00', 'HH:mm')

if (now.isBefore(start) && !now.isAfter(finish))
  now.add(1, 'day')

console.log(start.format())
console.log(finish.format())
console.log(now.format())


if (now.isBetween(start, finish)) {
  console.log('sending right now')
} else {
  if (start.isBefore(now))
    start.add(1, 'day')
  console.log('sending later', start.diff(now))
}
