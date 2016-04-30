import Hashids from 'hashids'

let ii = 0

const hashids = new Hashids('mentor-mutations', 8)

let nextMutationId = () => hashids.encode(ii++)

export {
  nextMutationId
}
