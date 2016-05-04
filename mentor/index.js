import fetch from 'node-fetch'

import mutations from './mutations'
import queries from './queries'

let mentors = []


const ViewerQuery = () => `
  query q { viewer { id } }
`

const TelegramUserMutation = ({ id, first_name, last_name, username }) => `
  mutation m {
    introduceTelegramUser(input: {
      clientMutationId:   "telegram"
      authToken:          "telegram"
      id:                 "${id}"
      firstName:          "${first_name}"
      lastName:           "${last_name}"
      username:           "${username}"
    }) {
      clientMutationId
    }
  }
`

const SubscribeOnTopicMutation = (topic_id) => `
  mutation m {
    subscribeOnTopic(input: {
      clientMutationId: "telegram",
      topicID: "${topic_id}"
    }) {
      clientMutationId
    }
  }
`


const TopicsQuery = () => `
  query q {
    viewer {
      topics(filter: DEFAULT) {
        availableSlotsCount
        edges {
          node {
            id
            name
            description
            isSubscribedByViewer
          }
        }
      }
    }
  }
`

const InsightQuery = (topic_id) => `
  query q {
    node(id: "${topic_id}") {
      ... on Topic {
        insights(filter: NEW, first: 1) {
          edges {
            node {
              id
              content
              origin {
                url
                title
                author
                duration
              }
              likeReaction {
                content
              }
              dislikeReaction {
                content
              }
            }
          }
        }
      }
    }
  }
`


class Mentor {

  constructor(token) {
    this._token = token
  }

  viewer = () => this._request(ViewerQuery()).then(data => data.viewer)

  topics = async () =>
    await this._request(TopicsQuery()).then(data => data.viewer.topics)

  createTelegramUser = async (user) =>
    await this._request(TelegramUserMutation(user))

  subscribeOnTopic = async (topic_id) =>
    await this._request(SubscribeOnTopicMutation(topic_id))

  adviceForTopic = (topic_id) => this._request(InsightQuery(topic_id)).then(data => data.node)

  likeInsightInTopic = (topic_id, insight_id) =>
    this._request(likeInsightInTopic({ insight_id, topic_id }))

  postponeInsightInTopic = (topic_id, insight_id) =>
    this._request(postponeInsightInTopic({ insight_id, topic_id }))

  dislikeInsightInTopic = (topic_id, insight_id) =>
    this._request(dislikeInsightInTopic({ insight_id, topic_id }))

  mutate = (name, payload) => this._request(mutations[name](payload))

  query = (name, variables) => this._request(queries[name], variables)

  _request = (query, variables) =>
    fetch(process.env.MENTOR_GRAPHQL_URL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-User-Id': this._token
      },
      body: JSON.stringify({
        query,
        variables
      })
    })
    .then(result => result.json())
    .then(json => {
      if (json.errors) {
        throw json.errors
      } else {
        return json.data
      }
    })
    .catch(error => { throw error })

}


let mentor = (token) =>
  mentors[token] || (mentors[token] = new Mentor(token))

export default mentor
