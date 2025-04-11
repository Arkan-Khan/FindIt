import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('userAuth');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        const userState = userData.userState;
        
        if (userState && userState.token) {
          config.headers.Authorization = `Bearer ${userState.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userAuth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;