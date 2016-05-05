let sleep = (time) =>
  new Promise((done, fail) => setTimeout(done, time))

export default sleep
