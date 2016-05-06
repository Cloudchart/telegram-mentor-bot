import {
  nextMutationId
} from './utils'


let getMutationName = (name) => {
  switch(name) {
    case 'subscribe':
      return 'subscribeOnTopic'
    case 'unsubscribe':
      return 'unsubscribeFromTopic'
  }
}


const StatusMutation = (name) => `
  mutation m($topic_id: ID!) {
    ${getMutationName(name)}(input: {
      clientMutationId: "${ nextMutationId() }"
      topicID: $topic_id
    }) {
      clientMutationId
    }
  }
`

export let subscribeOnTopic = StatusMutation('subscribe')
export let unsubscribeFromTopic = StatusMutation('unsubscribe')
