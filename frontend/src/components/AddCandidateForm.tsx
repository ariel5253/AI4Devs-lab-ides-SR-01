import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import './AddCandidateForm.css';

// Esquema de validación Zod
const candidateSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Formato de correo electrónico inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  cv: z.instanceof(FileList).optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

/**
 * Componente de formulario para añadir candidatos
 * Incluye validación, subida de CV y manejo de errores
 */
const AddCandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [messageId] = useState(`message-${Date.now()}`);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  });

  const onSubmit = async (data: CandidateFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (data.address) formData.append('address', data.address);
      if (data.education) formData.append('education', data.education);
      if (data.experience) formData.append('experience', data.experience);
      if (data.cv && data.cv.length > 0) {
        formData.append('cv', data.cv[0]);
      }

      const response = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el candidato');
      }

      // Éxito
      setSubmitMessage({
        type: 'success',
        text: 'Candidato creado exitosamente',
      });

      // Limpiar formulario
      reset();

      // Enfocar el mensaje de éxito para accesibilidad
      setTimeout(() => {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
          messageElement.focus();
        }
      }, 100);
    } catch (error: any) {
      let errorMessage = 'Error al crear el candidato. Por favor, inténtalo de nuevo.';

      if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con el servidor. Verifica que el backend esté corriendo.';
      }

      setSubmitMessage({
        type: 'error',
        text: errorMessage,
      });

      // Enfocar el mensaje de error para accesibilidad
      setTimeout(() => {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
          messageElement.focus();
        }
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-candidate-form-container">
      <header className="form-header">
        <h1>Añadir Candidato</h1>
        <p>Completa el formulario para añadir un nuevo candidato al sistema ATS</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="candidate-form" noValidate>
        {/* Mensaje de éxito/error */}
        {submitMessage && (
          <div
            id={messageId}
            className={`form-message ${submitMessage.type}`}
            role="alert"
            aria-live="polite"
            tabIndex={-1}
          >
            {submitMessage.text}
          </div>
        )}

        {/* Nombre */}
        <div className="form-group">
          <label htmlFor="firstName" className="required">
            Nombre
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <span id="firstName-error" className="error-message" role="alert">
              {errors.firstName.message}
            </span>
          )}
        </div>

        {/* Apellido */}
        <div className="form-group">
          <label htmlFor="lastName" className="required">
            Apellido
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <span id="lastName-error" className="error-message" role="alert">
              {errors.lastName.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="required">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-message" role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Teléfono */}
        <div className="form-group">
          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span id="phone-error" className="error-message" role="alert">
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Dirección */}
        <div className="form-group">
          <label htmlFor="address">Dirección</label>
          <textarea
            id="address"
            rows={3}
            {...register('address')}
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          {errors.address && (
            <span id="address-error" className="error-message" role="alert">
              {errors.address.message}
            </span>
          )}
        </div>

        {/* Educación */}
        <div className="form-group">
          <label htmlFor="education">Educación</label>
          <textarea
            id="education"
            rows={3}
            {...register('education')}
            aria-invalid={errors.education ? 'true' : 'false'}
            aria-describedby={errors.education ? 'education-error' : undefined}
          />
          {errors.education && (
            <span id="education-error" className="error-message" role="alert">
              {errors.education.message}
            </span>
          )}
        </div>

        {/* Experiencia */}
        <div className="form-group">
          <label htmlFor="experience">Experiencia Laboral</label>
          <textarea
            id="experience"
            rows={4}
            {...register('experience')}
            aria-invalid={errors.experience ? 'true' : 'false'}
            aria-describedby={errors.experience ? 'experience-error' : undefined}
          />
          {errors.experience && (
            <span id="experience-error" className="error-message" role="alert">
              {errors.experience.message}
            </span>
          )}
        </div>

        {/* CV */}
        <div className="form-group">
          <label htmlFor="cv">CV (PDF o DOCX, máximo 5 MB)</label>
          <input
            id="cv"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            {...register('cv')}
            aria-invalid={errors.cv ? 'true' : 'false'}
            aria-describedby={errors.cv ? 'cv-error' : 'cv-help'}
          />
          <span id="cv-help" className="help-text">
            Formatos aceptados: PDF, DOCX. Tamaño máximo: 5 MB
          </span>
          {errors.cv && (
            <span id="cv-error" className="error-message" role="alert">
              {errors.cv.message}
            </span>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Candidato'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCandidateForm;
