const Types = ['url', 'callback_data', 'switch_inline_query']

export default class InlineKeyboardButton {

  constructor({ text, ...optionals }) {
    this.text = text
    this.type = Types.find(type => !!optionals[type])
    this.value = optionals[this.type]
  }

  json() {
    if (!this._json) {
      this._json = { text: this._text }
      this._json[this.type] = this.value
    }
    return this._json
  }

}
