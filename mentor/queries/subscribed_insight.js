export default `
  query q {
    viewer {
      insights(filter: UNRATED, first: 1) {
        edges {
          topic {
            id
          }
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
`
