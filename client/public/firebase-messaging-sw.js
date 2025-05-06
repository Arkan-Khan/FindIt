importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA3rLkHK-_A5gjTLBwu1LZu1jjEPg1sIjw",
  authDomain: "findit-e2961.firebaseapp.com",
  projectId: "findit-e2961",
  storageBucket: "findit-e2961.firebaseapp.com",
  messagingSenderId: "240856354387",
  appId: "1:240856354387:web:a28339fa348c2db9cfc0a6",
  measurementId: "G-7B9H1G8VYP"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    data: payload.data,
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {

  event.notification.close();
  const groupId = event.notification.data?.groupId;
  
  if (groupId) {
    const url = `/groups/${groupId}`;
    
    event.waitUntil(
      clients.matchAll({type: 'window', includeUncontrolled: true})
        .then(function(clientList) {
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url.includes(groupId) && 'focus' in client) {
              return client.focus();
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});