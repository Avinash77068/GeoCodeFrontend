import client from './client'

export const getAdminDashboard = () =>
  client.get('/admin/dashboard').then((r) => r.data)

export const getAllMessages = (params) =>
  client.get('/admin/messages', { params }).then((r) => r.data)

export const updateAdminMessage = (id, data) =>
  client.put(`/admin/messages/${id}`, data).then((r) => r.data)

export const deleteAdminMessage = (id) =>
  client.delete(`/admin/messages/${id}`).then((r) => r.data)

export const getUserSearches = (userId) =>
  client.get(`/admin/users/${userId}/searches`).then((r) => r.data)

export const getUserMessages = (userId) =>
  client.get(`/admin/users/${userId}/messages`).then((r) => r.data)

export const deleteUser = (userId) =>
  client.delete(`/admin/users/${userId}`).then((r) => r.data)

export const getAllSearches = () =>
  client.get('/admin/searches').then((r) => r.data)

export const deleteSearch = (id) =>
  client.delete(`/admin/searches/${id}`).then((r) => r.data)
