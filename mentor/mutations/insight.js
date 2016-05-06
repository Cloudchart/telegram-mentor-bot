import {
  nextMutationId
} from './utils'


let getMutationName = (rate) => {
  switch(rate) {
    case 1:
      return 'likeInsightInTopic'
    case 0:
      return 'postponeInsightInTopic'
    case -1:
      return 'dislikeInsightInTopic'
  }
}


const RateMutation = (rate) => `

  mutation m($insight_id: ID!, $topic_id: ID!) {
    ${ getMutationName(rate) }(input: {
      clientMutationId: "${ nextMutationId() }"
      topicID: $topic_id
      insightID: $insight_id
    }) {
      insight {
        likeReaction {
          content
        }
        dislikeReaction {
          content
        }
      }
    }
  }

`


export let likeInsightInTopic     = RateMutation(1)
export let postponeInsightInTopic = RateMutation(0)
export let dislikeInsightInTopic  = RateMutation(-1)
