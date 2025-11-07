import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RecruiterDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  education: string | null;
  experience: string | null;
  cvUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Componente del Dashboard del Reclutador
 * Muestra un botón para añadir candidatos y una tabla con todos los candidatos registrados
 */
const RecruiterDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/candidates`);
        
        if (!response.ok) {
          throw new Error('Error al obtener la lista de candidatos');
        }

        const data = await response.json();
        setCandidates(data);
      } catch (err: any) {
        setError(err.message || 'Error al obtener la lista de candidatos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getFullName = (candidate: Candidate) => {
    return `${candidate.firstName} ${candidate.lastName}`;
  };

  return (
    <div className="recruiter-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard del Reclutador</h1>
        <p>Gestiona tus candidatos y procesos de selección</p>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-actions">
          <Link to="/add-candidate" className="btn-add-candidate">
            Añadir candidato
          </Link>
        </div>

        <section className="candidates-section" aria-label="Lista de candidatos">
          <h2 className="section-title">Candidatos Registrados</h2>

          {isLoading && (
            <div className="loading-message" role="status" aria-live="polite">
              Cargando candidatos...
            </div>
          )}

          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {!isLoading && !error && candidates.length === 0 && (
            <div className="empty-message" role="status" aria-live="polite">
              No hay candidatos registrados aún
            </div>
          )}

          {!isLoading && !error && candidates.length > 0 && (
            <div className="table-container">
              <table className="candidates-table" role="table">
                <thead>
                  <tr>
                    <th scope="col">Nombre Completo</th>
                    <th scope="col">Correo Electrónico</th>
                    <th scope="col">Teléfono</th>
                    <th scope="col">Educación</th>
                    <th scope="col">Experiencia</th>
                    <th scope="col">CV</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>{getFullName(candidate)}</td>
                      <td>
                        <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                      </td>
                      <td>{candidate.phone || '-'}</td>
                      <td>{candidate.education || '-'}</td>
                      <td>{candidate.experience || '-'}</td>
                      <td>
                        {candidate.cvUrl ? (
                          <a
                            href={`${API_BASE_URL}${candidate.cvUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-link"
                          >
                            Ver CV
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
