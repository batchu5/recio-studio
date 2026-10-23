import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RecoilRoot } from 'recoil'
import axios from 'axios'

const BackendUrl = import.meta.env.VITE_BACKEND_URL;

// Attach our auth token to every backend request.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.url?.startsWith(BackendUrl)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired or invalid token means the user has to sign in again.
axios.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && error.config?.url?.startsWith(BackendUrl)) {
    localStorage.removeItem("token");
    localStorage.setItem("isFromProtectedRoute", window.location.pathname);
    window.location.href = "/signin";
  }
  return Promise.reject(error);
});

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
   
  </StrictMode>,
)
