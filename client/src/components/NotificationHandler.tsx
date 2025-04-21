import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { requestNotificationPermission, onMessageListener } from '../firebase/firebase';

const NotificationHandler = () => {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Request permission and save FCM token when user logs in
    const registerToken = async () => {
      if (!user?.token) return;
      
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          // Save the token to the backend
          await axios.post(
            `${backendUrl}/notifications/tokens`,
            { token: fcmToken },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          console.log('FCM token saved');
        }
      } catch (error) {
        console.error('Error saving FCM token:', error);
      }
    };

    registerToken();
  }, [user?.token, backendUrl]);

  // Handle foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        // Create and show browser notification
        if (Notification.permission === 'granted') {
          const title = payload.notification?.title || 'New Notification';
          const options = {
            body: payload.notification?.body,
            icon: '/react.svg', // Path to your icon
            data: payload.data,
            onClick: () => handleNotificationClick(payload.data)
          };
          
          // Show the browser notification
          const notification = new Notification(title, options);
          
          // Add click event listener to the notification
          notification.onclick = () => handleNotificationClick(payload.data);
        }
      })
      .catch(err => console.log('Failed to receive notification: ', err));

    return () => {
      unsubscribe?.catch(err => console.log(err));
    };
  }, [navigate]);

  // Handle notification click
  const handleNotificationClick = (data: any) => {
    if (data?.groupId && data?.type === 'NEW_POST') {
      navigate(`/groups/${data.groupId}`);
      
      // Focus on the window if it's not in focus
      if (window.focus) window.focus();
    }
  };

  return null;
};

export default NotificationHandler;