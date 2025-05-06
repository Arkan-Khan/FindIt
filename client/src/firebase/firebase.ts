import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const checkMessagingSupport = async () => {
  try {
    return await isSupported();
  } catch (error) {
    console.error("Firebase messaging not supported", error);
    return false;
  }
};

let messaging: any = null;
const initializeMessaging = async () => {
  const isMessagingSupported = await checkMessagingSupport();
  if (isMessagingSupported) {
    messaging = getMessaging(app);
    return messaging;
  }
  return null;
};

const FCM_TOKEN_KEY = 'fcm_token';

export const requestNotificationPermission = async () => {
  try {
    const savedToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (savedToken) {
      return savedToken;
    }
    
    if (!messaging) {
      await initializeMessaging();
      if (!messaging) {
        console.log('Messaging not supported in this browser');
        return null;
      }
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        localStorage.setItem(FCM_TOKEN_KEY, token);
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

initializeMessaging();

export { messaging };