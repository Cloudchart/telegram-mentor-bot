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

export let savedInsightMarkup = ({ hasPreviousPage, hasNextPage }) => {
  let buttons = []
  if (hasPreviousPage)
    buttons.push({ text: 'Back', callback_data: 'back' })
  if (hasNextPage)
    buttons.push({ text: 'Next', callback_data: 'next' })

  if (buttons.length > 0)
    buttons = [buttons]

  return {
    reply_markup: {
      inline_keyboard: buttons
    }
  }
}

export let sample = (array) =>
  array[Math.round(Math.random() * (array.length - 1))]
