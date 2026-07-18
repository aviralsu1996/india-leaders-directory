import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import MinisterApp from './minister-App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MinisterApp />
  </StrictMode>,
);
