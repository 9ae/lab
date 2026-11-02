import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import PortalCube from './PortalCube';
import ShaderWords from './ShaderWords';
import Drawing from './Drawing';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Routes, Route } from "react-router-dom";

import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/portalcube" element={<PortalCube />} />
        <Route path="/shaderwords" element={<ShaderWords />} />
        <Route path="/drawing" element={<Drawing />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
