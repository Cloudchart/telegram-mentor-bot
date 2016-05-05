export let humanizeTopics = (topics) => {
  let names = topics.map(topic => `*${topic.name}*`)
  let head = names.slice(0, topics.length - 1).join(', ')
  let tail = names[names.length - 1]
  return [head, tail].join(' and ')
}

export let sample = (array) =>
  array[Math.round(Math.random() * (array.length - 1))]
