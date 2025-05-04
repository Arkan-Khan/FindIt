import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Check if messaging is supported in this browser
const checkMessagingSupport = async () => {
  try {
    return await isSupported();
  } catch (error) {
    console.error("Firebase messaging not supported", error);
    return false;
  }
};

// Initialize messaging if supported
let messaging: any = null;
const initializeMessaging = async () => {
  const isMessagingSupported = await checkMessagingSupport();
  if (isMessagingSupported) {
    messaging = getMessaging(app);
    return messaging;
  }
  return null;
};

// Local storage key for FCM token
const FCM_TOKEN_KEY = 'fcm_token';

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    // Check if we already have a token in local storage
    const savedToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (savedToken) {
      console.log('Using existing FCM token from local storage');
      return savedToken;
    }
    
    // Initialize messaging if not already done
    if (!messaging) {
      await initializeMessaging();
      if (!messaging) {
        console.log('Messaging not supported in this browser');
        return null;
      }
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        // Save token to local storage for reuse
        localStorage.setItem(FCM_TOKEN_KEY, token);
        console.log('FCM Token saved to local storage:', token);
      }
      
      return token;
    }
    console.log('Notification permission denied');
    return null;
  } catch (error) {
    console.error('An error occurred while requesting permission:', error);
    return null;
  }
};

export const deleteFcmToken = () => {
  localStorage.removeItem(FCM_TOKEN_KEY);
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      initializeMessaging().then((messagingInstance) => {
        if (messagingInstance) {
          onMessage(messagingInstance, (payload) => {
            resolve(payload);
          });
        }
      });
    } else {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
};

// Initialize messaging when the module is imported
initializeMessaging();

export { messaging };