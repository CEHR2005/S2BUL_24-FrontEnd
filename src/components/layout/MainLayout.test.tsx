import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';
import { Header } from './Header';
import { Footer } from './Footer';

// Mock the Header and Footer components
vi.mock('./Header', () => ({
  Header: vi.fn(() => <div data-testid="mock-header">Mock Header</div>),
}));

vi.mock('./Footer', () => ({
  Footer: vi.fn(() => <div data-testid="mock-footer">Mock Footer</div>),
}));

describe('MainLayout', () => {
  it('renders the Header component', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // Check if Header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(Header).toHaveBeenCalled();
  });
  
  it('renders the Footer component', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // Check if Footer is rendered
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(Footer).toHaveBeenCalled();
  });
  
  it('renders the children content', () => {
    render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );
    
    // Check if children content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('applies the correct layout structure', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // Check if the main container has the expected classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('flex-col');
    expect(mainContainer).toHaveClass('min-h-screen');
    
    // Check if the main content area has the expected classes
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('container');
    expect(mainContent).toHaveClass('mx-auto');
    expect(mainContent).toHaveClass('flex-grow');
    expect(mainContent).toHaveClass('p-4');
  });
});