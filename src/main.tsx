import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { HomeRoute } from './routes/home';
import { SettingsRoute } from './routes/settings';
import { YaegerConnectionProvider } from './context/YaegerConnectionProvider.tsx';
import { RecorderProvider } from './context/RecorderProvider.tsx';
import { PidControlProvider } from './context/PidControlProvider.tsx';
import { ProfileExecutionProvider } from './context/ProfileExecutionProvider.tsx';

const HOST = import.meta.env.VITE_WS_HOST || window.location.host;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <YaegerConnectionProvider host={HOST}>
      <PidControlProvider>
        <RecorderProvider>
          <ProfileExecutionProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/settings" element={<SettingsRoute />} />
              </Routes>
            </BrowserRouter>
          </ProfileExecutionProvider>
        </RecorderProvider>
      </PidControlProvider>
    </YaegerConnectionProvider>
  </StrictMode>,
);
