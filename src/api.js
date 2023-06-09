import axios from 'axios'
import { SERVER } from './utils/config';
const HTTP_UNAUTHORIZED = 401
const API = axios.create({
  baseURL: `${SERVER}/api`,
  timeout: 35000,
})

API.interceptors.request.use(async (config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

API.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response.status === HTTP_UNAUTHORIZED) {
    console.log('Unauthorized')
  }
})

// Request helpers ($get, $post, ...) to retrieve data directly
for (const method of ['request', 'delete', 'get', 'head', 'options', 'post', 'put', 'patch']) {
  API['$' + method] = (...args) => (API[method](...args).then((res) => (res && res.data)))
}
export default API
