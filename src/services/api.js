import api from '../api'

const addWallet = (payload) => {
  return api.post('/add-wallet', payload)
}

const getWallet = () => {
  return api.get('/get-wallet')
}

const removeWallet = (payload) => {
  return api.post('/remove-wallet', payload)
}

export {
  addWallet,
  getWallet,
  removeWallet
}
