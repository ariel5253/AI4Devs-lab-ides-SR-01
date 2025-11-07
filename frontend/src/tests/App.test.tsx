import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders recruiter dashboard', () => {
  render(<App />);
  const dashboardTitle = screen.getByText(/dashboard del reclutador/i);
  expect(dashboardTitle).toBeInTheDocument();
});
