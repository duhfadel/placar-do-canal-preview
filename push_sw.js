// The service worker that receives "a raffle just opened".
//
// It lives at a scope of its own so it does not replace Flutter's worker,
// which owns "/". A worker does not need to control any page to receive a
// push — it only needs to exist.

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = {};
  }

  const title = payload.title || 'Sorteio no ar';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: 'icons/Icon-192.png',
      badge: 'icons/Icon-192.png',
      // One tag, so a second raffle replaces the first instead of stacking a
      // pile of notifications nobody reads.
      tag: 'placar-do-canal',
      renotify: true,
      data: { url: payload.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';

  // Reuse a tab that already has the site open rather than piling up new ones.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(
      (windows) => {
        for (const client of windows) {
          if (client.url.startsWith(url) && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      },
    ),
  );
});
