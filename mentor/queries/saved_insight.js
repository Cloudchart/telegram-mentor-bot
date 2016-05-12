export default `
  query q($id: ID!, $first: Int, $last: Int, $before: String, $after: String) {
    node(id: $id) {
      ... on Topic {
        insights(filter: LIKED, first: $first, last: $last, before: $before, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              content
              origin {
                url
                title
                author
                duration
              }
            }
          }
        }
      }
    }
  }
`
