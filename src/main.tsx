import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { HomeRoute } from './routes/home';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
