import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Navigation', () => {
  it('renders navigation items', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('건강 데이터')).toBeInTheDocument();
    expect(screen.getByText('진료 기록')).toBeInTheDocument();
    expect(screen.getByText('복약 관리')).toBeInTheDocument();
    expect(screen.getByText('유전체 분석')).toBeInTheDocument();
  });

  it('renders logo and brand name', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('KnowledgeHub')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('가이드')).toBeInTheDocument();
    expect(screen.getByText('홈')).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    renderWithRouter(<Navigation />);

    const toggleButton = screen.getByLabelText('모바일 메뉴 토글');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles mobile menu with keyboard (Enter key)', () => {
    renderWithRouter(<Navigation />);

    const toggleButton = screen.getByLabelText('모바일 메뉴 토글');
    
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes mobile menu with Escape key', () => {
    renderWithRouter(<Navigation />);

    const toggleButton = screen.getByLabelText('모바일 메뉴 토글');
    
    // Open menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Close with Escape
    fireEvent.keyDown(toggleButton, { key: 'Escape' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('highlights active navigation item', () => {
    renderWithRouter(<Navigation />, { route: '/dashboard' });

    const dashboardLink = screen.getByRole('menuitem', { name: /대시보드 페이지로 이동/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Navigation />);

    const nav = screen.getByRole('navigation', { name: '주 네비게이션' });
    expect(nav).toBeInTheDocument();

    const menubar = screen.getByRole('menubar', { name: '주 메뉴' });
    expect(menubar).toBeInTheDocument();

    const toggleButton = screen.getByLabelText('모바일 메뉴 토글');
    expect(toggleButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });
});
