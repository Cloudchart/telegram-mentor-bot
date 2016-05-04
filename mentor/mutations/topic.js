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


const StatusMutation = ({ topic_id, name }) => `
  mutation m {
    ${getMutationName(name)}(input: {
      clientMutationId: "${ nextMutationId() }"
      topicID: "${topic_id}"
    }) {
      clientMutationId
    }
  }
`

export let subscribeOnTopic = (payload) => StatusMutation({ ...payload, name: 'subscribe' })
export let unsubscribeFromTopic = (payload) => StatusMutation({ ...payload, name: 'unsubscribe' })
