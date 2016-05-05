import moment from 'moment'

export let insightOriginResponse = ({ author, title, url, duration }) => {
  let humanizedDuration = moment.duration(duration, 'seconds').humanize() + ' read'
  let humanizedOrigin = [author, title, humanizedDuration].filter(i => !!i).join(', ')
  return `[${humanizedOrigin}](${url.trim()})`
}


export let insightResponse = ({ content, origin }) => {
  return `
    ${content}
    ${insightOriginResponse(origin)}
  `
}

export let insightMarkup = () => ({
  reply_markup: {
    inline_keyboard: [[
      { text: `Skip`, callback_data: 'dislike' },
      { text: `I'll use it`, callback_data: 'like' }
    ]]
  },
  hide_keyboard: true,
})

export let sample = (array) =>
  array[Math.round(Math.random() * (array.length - 1))]
