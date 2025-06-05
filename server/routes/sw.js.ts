export default defineEventHandler(() => {
  // 返回一个空的 Service Worker
  return new Response('', {
    headers: {
      'Content-Type': 'application/javascript'
    }
  })
})
