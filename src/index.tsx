import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const rootDiv = document.getElementById('root');
if (!rootDiv) {
  throw Error("The react app has been misconfigured and no root div was found.");
}
const root = ReactDOM.createRoot(rootDiv);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
