import { describe, it, expect } from 'vitest';
import * as layoutExports from './index';
import { Header } from './Header';
import { Footer } from './Footer';
import { MainLayout } from './MainLayout';

describe('Layout exports', () => {
  it('should export Header component', () => {
    expect(layoutExports.Header).toBeDefined();
    expect(layoutExports.Header).toBe(Header);
  });

  it('should export Footer component', () => {
    expect(layoutExports.Footer).toBeDefined();
    expect(layoutExports.Footer).toBe(Footer);
  });

  it('should export MainLayout component', () => {
    expect(layoutExports.MainLayout).toBeDefined();
    expect(layoutExports.MainLayout).toBe(MainLayout);
  });

  it('should not export any unexpected components', () => {
    // Get all exported keys
    const exportedKeys = Object.keys(layoutExports);
    
    // Check that only the expected components are exported
    expect(exportedKeys).toHaveLength(3);
    expect(exportedKeys).toContain('Header');
    expect(exportedKeys).toContain('Footer');
    expect(exportedKeys).toContain('MainLayout');
  });
});