import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/useAuthStore';
import { useFavoriteStore } from './store/useFavoriteStore';
import { systemApi } from './api/endpoints';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  const { fetchCurrentUser, isAuthenticated } = useAuthStore();
  const { fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  // Sync global settings (Title and Favicon)
  useEffect(() => {
    systemApi.getSettings()
      .then((res) => {
        const data = res.data || {};
        const siteTitle = data.site_name || 'SR TesChor';
        window.__appSiteTitle = siteTitle;
        document.title = siteTitle;
        if (data.site_logo) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.site_logo;
        }
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
