import client from './client'

export const getStats = () =>
  client.get('/export/stats').then((r) => r.data)

export const exportLeads = async (params) => {
  if (params.format === 'csv') {
    const response = await client.get('/export/leads', {
      params,
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'leads.csv'
    link.click()
    URL.revokeObjectURL(url)
    return { success: true }
  }
  return client.get('/export/leads', { params }).then((r) => r.data)
}
