import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { HomeRoute } from './routes/home';
import { SettingsRoute } from './routes/settings';
import { YaegerConnectionProvider } from './context/YaegerConnectionProvider.tsx';
import { RecorderProvider } from './context/RecorderProvider.tsx';

const HOST = 'localhost:8080'; //window.location.host;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <YaegerConnectionProvider host={HOST}>
      <RecorderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
          </Routes>
        </BrowserRouter>
      </RecorderProvider>
    </YaegerConnectionProvider>
  </StrictMode>,
);
