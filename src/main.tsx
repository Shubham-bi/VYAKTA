import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const STAGING_HOST = "tornatitanstg.shauryatechnosoft.com";
const PROD_HOST = "tornatitans.shauryatechnosoft.com";

if (window.location.hostname === STAGING_HOST) {
  const targetUrl =
    "https://" +
    PROD_HOST +
    window.location.pathname +
    window.location.search +
    window.location.hash;

  window.location.replace(targetUrl);
}

createRoot(document.getElementById('root')!).render(
  <App />,
)
