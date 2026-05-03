import client from './client'

export const searchBusinesses = (params) =>
  client.get('/search', { params }).then((r) => r.data)

export const getBusinessDetails = (id) =>
  client.get(`/search/business/${id}`).then((r) => r.data)

export const getSearchHistory = (params) =>
  client.get('/search/history', { params }).then((r) => r.data)
