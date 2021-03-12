/**
 * Service Worker
 */

const _version = 'v2';

// Functional: PUSH
// 클라이언트측 말고 service-worker에 등록된 push이벤트에 html정보를 받아와서 처리하고 싶은데 안된다
// 위 방법이 불가하면 굳이 service-worker를 사용할 필요가 없다

self.addEventListener('push', function(event) {
  const payload = event.data ? event.data.json() : 'no payload';

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
    })
  );
});

// TODO: Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url == self.registration.scope && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});
