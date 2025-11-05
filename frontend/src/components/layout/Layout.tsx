import React from 'react';
import Navigation from '../common/Navigation';
import { Footer } from '../common/Footer/Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Navigation />
      <main className={styles.layoutMain}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;