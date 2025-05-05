import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { requestNotificationPermission, onMessageListener } from '../firebase/firebase';

// Define proper type for the notification payload
interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    groupId?: string;
    [key: string]: any;
  };
}

const NotificationHandler = () => {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [tokenRegistered, setTokenRegistered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const registerToken = async () => {
      if (!user?.token || tokenRegistered) return;
      
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken && isMounted) {
          await axios.post(
            `${backendUrl}notifications/tokens`,
            { token: fcmToken },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          setTokenRegistered(true);
        }
      } catch (error) {
        console.error('Error saving FCM token:', error);
      }
    };

    registerToken();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.token, backendUrl, tokenRegistered]);

  // Handle foreground messages
  useEffect(() => {
    const handleMessage = async () => {
      try {
        const messageListener = onMessageListener();
        const payload = await messageListener as NotificationPayload;

        if (Notification.permission === 'granted' && payload) {
          const title = payload.notification?.title || 'New Notification';
          const options = {
            body: payload.notification?.body,
            icon: '/react.svg', // Path to your icon
            requireInteraction: true // Keep notification until user interacts with it
          };
          
          // Show the browser notification
          const notification = new Notification(title, options);
          
          // Add click event listener to the notification
          notification.onclick = () => handleNotificationClick(payload.data);
        }
      } catch (err) {
        console.log('Failed to receive notification: ', err);
      }
    };

    // Start listening for messages
    const messageHandlerInterval = setInterval(handleMessage, 1000);

    return () => {
      clearInterval(messageHandlerInterval);
    };
  }, [navigate]);

  // Handle notification click
  const handleNotificationClick = (data?: NotificationPayload['data']) => {
    if (data?.groupId) {
      navigate(`/groups/${data.groupId}`);
      
      // Focus on the window if it's not in focus
      if (window.focus) window.focus();
    }
  };

  return null;
};

export default NotificationHandler;