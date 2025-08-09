import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { APP_ROOT_ID, APP_LOG_PREFIX } from './constants';

// Check if the root element already exists
let rootContainer = document.getElementById(APP_ROOT_ID);
// If it doesn't exist, create and inject it into the page
if (!rootContainer) {
    console.info(APP_LOG_PREFIX + 'Injecting React app into #' + APP_ROOT_ID);
    rootContainer = document.createElement('div');
    rootContainer.id = APP_ROOT_ID;
    document.body.appendChild(rootContainer);
}
const root = ReactDOM.createRoot(rootContainer!);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
