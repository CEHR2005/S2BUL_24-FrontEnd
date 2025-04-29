import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the footer with copyright information', () => {
    render(<Footer />);
    
    // Check if copyright text is displayed
    const copyrightText = screen.getByText(/Advanced Programming_S2BUL_24/);
    expect(copyrightText).toBeInTheDocument();
    
    // Check if the current year is included in the copyright text
    const currentYear = new Date().getFullYear().toString();
    expect(copyrightText.textContent).toContain(currentYear);
    
    // Check if the author name is displayed
    expect(copyrightText.textContent).toContain('Arsentii Bieliaiev');
  });
  
  it('includes the student ID in the copyright text', () => {
    render(<Footer />);
    
    // Check if the student ID is displayed
    const copyrightText = screen.getByText(/st2218026/);
    expect(copyrightText).toBeInTheDocument();
  });
});