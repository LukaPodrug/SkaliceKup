import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import NewsPage from './pages/NewsPage';
import ResultsPage from './pages/ResultsPage';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ArticlePage from './pages/ArticlePage';

const tabRoutes = ['/', '/news', '/results'];

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current path starts with any tab route
  const getCurrentTab = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/news')) return 1;
    if (location.pathname.startsWith('/results')) return 2;
    return 0; // default to home
  };
  
  const tab = getCurrentTab();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    navigate(tabRoutes[newValue]);
  };

  return (
    <Layout tab={tab} handleTabChange={handleTabChange}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/article/:articleId" element={<ArticlePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/results/match/:matchId" element={<MatchPage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
        <Route path="/article/:articleId" element={<ArticlePage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
