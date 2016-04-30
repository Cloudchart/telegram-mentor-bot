export default function getMessageCommand(message) {
  if (!message.entities) return null

  let commandEntity = message.entities.find(entity => entity.type === 'bot_command')

  return commandEntity
    ? {
        command: message.text.slice(commandEntity.offset, commandEntity.length),
        payload: message.text.slice(commandEntity.offset + commandEntity.length + 1)
      }
    : null
}
