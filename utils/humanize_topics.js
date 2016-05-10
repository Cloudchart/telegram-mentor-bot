export default function(topics) {
  let names = topics.map(topic => `*${topic.name}*`)
  let head = names.slice(0, topics.length - 1).filter(part => !!part).join(', ')
  let tail = names[names.length - 1]
  return [head, tail].filter(part => !!part).join(' and ')
}
