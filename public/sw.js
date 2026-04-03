
self.addEventListener('push', function(e) {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'Nuvita', {
    body: d.body || 'Você tem uma notificação',
    icon: '/icon-192.png',
    data: { url: d.url || '/dashboard' },
  }));
});
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/dashboard'));
});
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
