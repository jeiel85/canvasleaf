import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 설치형 PWA: 프로덕션 빌드에서만 서비스워커 등록(개발 서버의 HMR 모듈을 캐시하지 않도록)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('서비스워커 등록 실패:', error);
    });
  });
}
