importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyA3rLkHK-_A5gjTLBwu1LZu1jjEPg1sIjw",
  authDomain: "findit-e2961.firebaseapp.com",
  projectId: "findit-e2961",
  storageBucket: "findit-e2961.firebaseapp.com",
  messagingSenderId: "240856354387",
  appId: "1:240856354387:web:a28339fa348c2db9cfc0a6",
  measurementId: "G-7B9H1G8VYP"
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/react.svg',
    data: payload.data,
    // This flag is important for clicking the notification to work properly
    requireInteraction: true
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  // Close the notification
  event.notification.close();
  
  // Get the notification data
  const groupId = event.notification.data?.groupId;
  
  if (groupId) {
    // This will open the window or focus it if it's already open
    const url = `/groups/${groupId}`;
    
    // Focus on an existing tab if it exists, otherwise open a new one
    event.waitUntil(
      clients.matchAll({type: 'window', includeUncontrolled: true})
        .then(function(clientList) {
          // Check if there is already a window/tab open with the target URL
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url.includes(groupId) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no matching window/tab is found, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});