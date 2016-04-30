import Redis from 'ioredis'

let redis = new Redis({ keyPrefix: process.env.REDIS_PREFIX })

let sessions = {}

let Session = {

  _read: (key) => {

  },

  _write: (key, data) => {

  },

  get: async (key) => {
    
  }
}

export default Session
