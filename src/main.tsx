import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { HomeRoute } from './routes/home';
import { SettingsRoute } from './routes/settings';
import { YaegerConnectionProvider } from './context/YaegerConnectionProvider.tsx';
import { RecorderProvider } from './context/RecorderProvider.tsx';
import { PidControlProvider } from './context/PidControlProvider.tsx';

//const HOST = 'yaeger.local';
const HOST = 'localhost:8080';
//const HOST =  window.location.host;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <YaegerConnectionProvider host={HOST}>
      <PidControlProvider>
        <RecorderProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/settings" element={<SettingsRoute />} />
            </Routes>
          </BrowserRouter>
        </RecorderProvider>
      </PidControlProvider>
    </YaegerConnectionProvider>
  </StrictMode>,
);
