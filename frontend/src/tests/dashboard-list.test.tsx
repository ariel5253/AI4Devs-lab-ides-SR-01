import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecruiterDashboard from '../components/RecruiterDashboard';

// Mock de fetch
global.fetch = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RecruiterDashboard - Lista de Candidatos', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should display loading message while fetching candidates', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => [] }), 100)
        )
    );

    renderWithRouter(<RecruiterDashboard />);

    expect(screen.getByText(/cargando candidatos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/cargando candidatos/i)).not.toBeInTheDocument();
    });
  });

  it('should display list of candidates with names and emails', async () => {
    const mockCandidates = [
      {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juanperez@example.com',
        phone: '3001234567',
        education: 'Ingeniería de Sistemas',
        experience: '3 años',
        cvUrl: null,
        address: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        firstName: 'María',
        lastName: 'González',
        email: 'mariagonzalez@example.com',
        phone: '3007654321',
        education: 'Administración',
        experience: '5 años',
        cvUrl: null,
        address: null,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCandidates,
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María González')).toBeInTheDocument();
      expect(screen.getByText('juanperez@example.com')).toBeInTheDocument();
      expect(screen.getByText('mariagonzalez@example.com')).toBeInTheDocument();
    });
  });

  it('should display empty message when no candidates exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no hay candidatos registrados aún/i)).toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error al obtener la lista de candidatos/i)).toBeInTheDocument();
    });
  });

  it('should display error message when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error al obtener la lista de candidatos/i)).toBeInTheDocument();
    });
  });

  it('should display CV link when cvUrl exists', async () => {
    const mockCandidates = [
      {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juanperez@example.com',
        phone: '3001234567',
        education: 'Ingeniería de Sistemas',
        experience: '3 años',
        cvUrl: '/uploads/cv-123.pdf',
        address: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCandidates,
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      const cvLink = screen.getByText('Ver CV');
      expect(cvLink).toBeInTheDocument();
      expect(cvLink).toHaveAttribute('href', expect.stringContaining('/uploads/cv-123.pdf'));
      expect(cvLink).toHaveAttribute('target', '_blank');
      expect(cvLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('should display dash (-) when cvUrl is null', async () => {
    const mockCandidates = [
      {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juanperez@example.com',
        phone: '3001234567',
        education: 'Ingeniería de Sistemas',
        experience: '3 años',
        cvUrl: null,
        address: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCandidates,
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      const tableCells = screen.getAllByText('-');
      // Debe haber al menos un dash para el CV (y posiblemente otros campos opcionales)
      expect(tableCells.length).toBeGreaterThan(0);
    });
  });

  it('should display phone, education, and experience when available', async () => {
    const mockCandidates = [
      {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juanperez@example.com',
        phone: '3001234567',
        education: 'Ingeniería de Sistemas',
        experience: '3 años',
        cvUrl: null,
        address: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCandidates,
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      expect(screen.getByText('3001234567')).toBeInTheDocument();
      expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument();
      expect(screen.getByText('3 años')).toBeInTheDocument();
    });
  });

  it('should maintain "Añadir candidato" button visible', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<RecruiterDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/añadir candidato/i)).toBeInTheDocument();
    });
  });
});

