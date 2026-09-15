import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker immediately for 100% offline support
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('San Takki Menu: готов к автономной работе (офлайн)');
  },
  onNeedRefresh() {
    // Auto-update to latest assets in background
  },
});

// Блокируем выделение текста и появление каретки/курсора при нажатии на текст меню
if (typeof window !== 'undefined') {
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    e.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

