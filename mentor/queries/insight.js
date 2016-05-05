export default `
  query q ($id: ID!) {
    node(id: $id) {
      ... on Insight {
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
`
