import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';
import { queryClient } from './api/queryClient';

// Auto-recover if a new production deployment replaces chunk hashes while user is browsing
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});
if (typeof Node === 'function' && Node.prototype) {
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return this.appendChild(newNode);
    }
    try {
      return originalInsertBefore.apply(this, arguments);
    } catch (e) {
      return this.appendChild(newNode);
    }
  };

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (child && child.parentNode) {
        try {
          return child.parentNode.removeChild(child);
        } catch (e) {
          return child;
        }
      }
      return child;
    }
    try {
      return originalRemoveChild.apply(this, arguments);
    } catch (e) {
      if (child && child.parentNode) {
        try {
          return child.parentNode.removeChild(child);
        } catch (err) {
          return child;
        }
      }
      return child;
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
);
