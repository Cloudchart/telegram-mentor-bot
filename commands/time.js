import ExecutionChains from '../execution_chains'

let perform = async (user) => {
  await ExecutionChains['time'].next(user)
}

export default {
  perform
}
