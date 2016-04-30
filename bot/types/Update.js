const UpdateTypes = ['message', 'inline_query', 'choosen_inline_result', 'callback_query']

export default class Update {

  constructor({
    update_id,
    message,
    inline_query,
    choosen_inline_result,
    callback_query,
  }) {

    this.id = update_id

    this.message = message
    this.inline_query = inline_query
    this.choosen_inline_result = choosen_inline_result
    this.callback_query = callback_query

    this.type = UpdateTypes.find(name => !!this[name])
    this.value = this[this.type]
  }

}
