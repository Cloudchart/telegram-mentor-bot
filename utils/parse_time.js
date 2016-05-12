import moment from 'moment'

const TimeFormats = ['H', 'HH', 'Hmm', 'HHmm', 'ha', 'hmma']

export default function(value) {
  value = value.toLowerCase()
  let ampm = value.match(/am|pm$/)
  ampm = ampm ? ampm[0] : ''
  value = value.replace(/[^\d]/g, '').trim() + ampm
  let result = TimeFormats.find(format => moment(value, format, true).isValid())
  return result
    ? moment(value, result).format('HH:mm')
    : null
}
