import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps all pages
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};