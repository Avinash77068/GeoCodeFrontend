import client from './client'

export const generateMessage = (data) =>
  client.post('/messages/generate', data).then((r) => r.data)

export const sendMessage = (data) =>
  client.post('/messages/send', data).then((r) => r.data)

export const bulkSendMessages = (data) =>
  client.post('/messages/bulk-send', data).then((r) => r.data)

export const getMessages = (params) =>
  client.get('/messages', { params }).then((r) => r.data)

export const getMessageById = (id) =>
  client.get(`/messages/${id}`).then((r) => r.data)
