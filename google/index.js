import fetch from 'node-fetch'


let location = async (address) => {
  return fetch(`${process.env.GOOGLE_MAPS_API_URL}/geocode/json?address=${address}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => response.json())
}


let timezone = async (latitude, longitude) => {

}


export default {
  location,
  timezone,
}
