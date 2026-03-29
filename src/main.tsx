import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { HomePage } from './routes/home';
import { YaegerConnectionProvider } from './context/YaegerConnectionProvider.tsx';
import { RecorderProvider } from './context/RecorderProvider.tsx';
import { PidControlProvider } from './context/PidControlProvider.tsx';
import { ProfileExecutionProvider } from './context/ProfileExecutionProvider.tsx';
import { EditorPage } from './routes/editor';
import { SettingsPage } from './routes/settings';

const HOST = import.meta.env.VITE_WS_HOST || window.location.host;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <YaegerConnectionProvider host={HOST}>
      <PidControlProvider>
        <RecorderProvider>
          <ProfileExecutionProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </BrowserRouter>
          </ProfileExecutionProvider>
        </RecorderProvider>
      </PidControlProvider>
    </YaegerConnectionProvider>
  </StrictMode>,
);
