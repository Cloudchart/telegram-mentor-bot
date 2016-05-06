import moment from 'moment'

const TimeFormats = ['H', 'HH', 'H:mm', 'HH:mm', 'Hmm', 'HHmm', 'H.mm', 'HH.mm', 'ha', 'h a']

export default function(value) {
  let result = TimeFormats.find(format => moment(value, format, true).isValid())
  return result
    ? moment(value, result).format('HH:mm')
    : null
}
