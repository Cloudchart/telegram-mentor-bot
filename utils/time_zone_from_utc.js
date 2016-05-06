export default function(utcOffset) {
  let sign  = utcOffset > 0 ? '+' : ''
  let hours = Math.floor(utcOffset / 60) || ''
  return `GMT${ sign }${ hours }`
}
