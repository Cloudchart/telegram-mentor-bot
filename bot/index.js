import fetch from 'node-fetch'

const Spec = {
  types: {
    Update: {
      update_id:              'Integer!',
      message:                'Message',
      inline_query:           'InlineQuery',
      choosen_inline_result:  'ChoosenInlineResult',
      callback_query:         'CallbackQuery',
    },
    User: {
      id:           'Integer!',
      first_name:   'String!',
      last_name:    'String',
      username:     'String',
    },
    Chat: {
      id:           'Integer!',
      type:         'String!',
      title:        'String',
      username:     'String',
      first_name:   'String',
      last_name:    'String',
    },
    Message: {
      message_id:               'Integer!',
      from:                     'User',
      date:                     'Integer!',
      chat:                     'Chat!',
      forward_from:             'User',
      forward_date:             'Integer',
      reply_to_message:         'Message',
      text:                     'String',
      entities:                 '[MessageEntity]',
      audio:                    'Audio',
      document:                 'Document',
      photo:                    '[PhotoSize]',
      sticker:                  'Sticker',
      video:                    'Video',
      voice:                    'Voice',
      caption:                  'String',
      contact:                  'Contact',
      location:                 'Location',
      venue:                    'Venue',
      new_chat_memder:          'User',
      left_chat_member:         'User',
      new_chat_title:           'String',
      new_chat_photo:           '[PhotoSize]',
      delete_chat_photo:        '{true}',
      group_chat_created:       '{true}',
      supergroup_chat_created:  '{true}',
      channel_chat_created:     '{true}',
      migrate_to_chat_id:       'Integer',
      migrate_from_chat_id:     'Integer',
      pinned_message:           'Message',
    },
    InlineQuery: {
      id:       'String!',
      from:     'User!',
      location: 'Location',
      query:    'String!',
      offset:   'String!',
    },
    ChoosenInlineResult: {
      result_id:          'Integer!',
      from:               'User!',
      location:           'Location',
      inline_message_id:  'String',
      query:              'String!',
    },
    CallbackQuery: {
      id:                 'String!',
      from:               'User!',
      message:            'Message',
      inline_message_id:  'String',
      data:               'String!',
    },
    MessageEntity: {
      type:     'String!',
      offset:   'Integer!',
      length:   'Integer!',
      url:      'String',
    },
    PhotoSize: {
      file_id:    'Integer!',
      width:      'Integer!',
      height:     'Integer!',
      file_size:  'Integer',
    },
    Audio: {
      file_id:    'Integer!',
      duration:   'Integer!',
      performer:  'String',
      title:      'String',
      mime_type:  'String',
      file_size:  'Integer',
    },
  }
}

let bots = {}

import {
  Update
} from './types'

class Bot {

  constructor() {
    this._token = process.env.TELEGRAM_TOKEN
    this._api_url = process.env.TELEGRAM_API_URL
  }

  getMe = () =>
    this._request('getMe')

  getUpdates = (payload) => {
    return this
      ._request('getUpdates', payload)
      .then(updates => updates.map(update => new Update(update)))
  }

  sendMessage = (chat_id, text, payload = {}) =>
    this._request('sendMessage', {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...payload,
      chat_id,
      text,
    })

  updateMessageReplyMarkup = (chat_id, message_id, reply_markup) =>
    this._request('editMessageReplyMarkup', {
      chat_id,
      message_id,
      reply_markup,
      disable_web_page_preview: true,
    })

  editMessageText = (chat_id, message_id, text, reply_markup) =>
    this._request('editMessageText', {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      chat_id,
      message_id,
      text,
      reply_markup,
    })

  _request = (method, payload) =>
    fetch(`${this._api_url}/bot${this._token}/${method}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(result => result.json())
    .then(json => {
      if (json.ok) {
        return json.result
      } else {
        throw json.description
      }
    })
    .catch(error => { throw error })

}

export default new Bot
