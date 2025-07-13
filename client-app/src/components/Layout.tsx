import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  tab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  children: React.ReactNode;
}

const HEADER_HEIGHT = 96; // px, match your header image height

const Layout: React.FC<LayoutProps> = ({ tab, handleTabChange, children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header tab={tab} handleTabChange={handleTabChange} />
    <div style={{ flex: 1 }}>{children}</div>
    <Footer />
  </div>
);

export default Layout; 