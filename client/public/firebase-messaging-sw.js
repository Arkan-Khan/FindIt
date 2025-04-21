// public/firebase-messaging-sw.js

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyA3rLkHK-_A5gjTLBwu1LZu1jjEPg1sIjw",
  authDomain: "findit-e2961.firebaseapp.com",
  projectId: "findit-e2961",
  storageBucket: "findit-e2961.firebasestorage.app",
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
    icon: 'react.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
