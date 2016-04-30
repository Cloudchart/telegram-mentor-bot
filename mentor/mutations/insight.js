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


const RateMutation = ({ insight_id, topic_id, rate}) => `

  mutation m {
    ${ getMutationName(rate) }(input: {
      clientMutationId: "${ nextMutationId() }"
      topicID: "${topic_id}"
      insightID: "${insight_id}"
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


export let likeInsightInTopic     = (payload) => RateMutation({ ...payload, rate: 1 })
export let postponeInsightInTopic = (payload) => RateMutation({ ...payload, rate: 0 })
export let dislikeInsightInTopic  = (payload) => RateMutation({ ...payload, rate: -1 })
