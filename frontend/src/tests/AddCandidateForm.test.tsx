import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AddCandidateForm from '../components/AddCandidateForm';

// Mock de fetch
global.fetch = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AddCandidateForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render the form with all fields', () => {
    renderWithRouter(<AddCandidateForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/educación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experiencia laboral/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cv/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AddCandidateForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /guardar candidato/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/formato de correo electrónico inválido/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AddCandidateForm />);

    const submitButton = screen.getByRole('button', { name: /guardar candidato/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/el apellido debe tener al menos 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Candidate created successfully',
        candidate: {
          id: '123',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juanperez@example.com',
        },
      }),
    });

    renderWithRouter(<AddCandidateForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Pérez');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'juanperez@example.com');

    const submitButton = screen.getByRole('button', { name: /guardar candidato/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/candidates'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/candidato creado exitosamente/i)).toBeInTheDocument();
    });
  });

  it('should display error message on server error', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<AddCandidateForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Pérez');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'juanperez@example.com');

    const submitButton = screen.getByRole('button', { name: /guardar candidato/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error de conexión con el servidor/i)).toBeInTheDocument();
    });
  });

  it('should display error message on 500 error', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Internal server error',
        message: 'Something went wrong',
      }),
    });

    renderWithRouter(<AddCandidateForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Pérez');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'juanperez@example.com');

    const submitButton = screen.getByRole('button', { name: /guardar candidato/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error al crear el candidato/i)).toBeInTheDocument();
    });
  });

  it('should handle file upload', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Candidate created successfully',
        candidate: {
          id: '123',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juanperez@example.com',
        },
      }),
    });

    renderWithRouter(<AddCandidateForm />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/cv/i) as HTMLInputElement;

    await user.upload(fileInput, file);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Pérez');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'juanperez@example.com');

    const submitButton = screen.getByRole('button', { name: /guardar candidato/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(formData).toBeInstanceOf(FormData);
    });
  });
});

