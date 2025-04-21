import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { requestNotificationPermission, onMessageListener } from '../firebase/firebase';

const NotificationHandler = () => {
  const user = useRecoilValue(userAtom);
  const [notification, setNotification] = useState<any>(null);
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
            `${backendUrl}notifications/tokens`,
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
        setNotification({
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data
        });
        
        // Show toast notification
        toast.info(
          <div onClick={() => handleNotificationClick(payload.data)}>
            <strong>{payload.notification?.title}</strong>
            <p>{payload.notification?.body}</p>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        );
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
    }
  };

  return null; // This component doesn't render anything
};

export default NotificationHandler;