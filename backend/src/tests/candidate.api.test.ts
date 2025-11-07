import request from 'supertest';
import { app } from '../app';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

describe('POST /api/candidates', () => {
  // Limpiar base de datos antes de cada test
  beforeEach(async () => {
    await prisma.candidate.deleteMany({});
  });

  // Limpiar archivos subidos después de cada test
  afterEach(async () => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        if (file.startsWith('cv-')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }
  });

  // Cerrar conexión de Prisma después de todos los tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a candidate with valid data', async () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juanperez@example.com',
      phone: '3001234567',
      address: 'Calle 123',
      education: 'Ingeniería de Sistemas',
      experience: '3 años',
    };

    const response = await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Candidate created successfully');
    expect(response.body.candidate).toHaveProperty('id');
    expect(response.body.candidate.firstName).toBe(candidateData.firstName);
    expect(response.body.candidate.email).toBe(candidateData.email);
  });

  it('should return 400 for invalid email format', async () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'invalid-email',
      phone: '3001234567',
    };

    const response = await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for firstName too short', async () => {
    const candidateData = {
      firstName: 'J',
      lastName: 'Pérez',
      email: 'juanperez@example.com',
    };

    const response = await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 409 for duplicate email', async () => {
    const candidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juanperez@example.com',
    };

    // Crear primer candidato
    await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(201);

    // Intentar crear duplicado
    const response = await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(409);

    expect(response.body).toHaveProperty('error', 'Duplicate entry');
    expect(response.body).toHaveProperty('message', 'A candidate with this email already exists');
  });

  it('should create candidate with optional fields only', async () => {
    const candidateData = {
      firstName: 'María',
      lastName: 'González',
      email: 'mariagonzalez@example.com',
    };

    const response = await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(201);

    expect(response.body.candidate).toHaveProperty('id');
    expect(response.body.candidate.phone).toBeNull();
    expect(response.body.candidate.address).toBeNull();
  });

  it('should handle server errors gracefully', async () => {
    // Simular error de base de datos cerrando Prisma
    await prisma.$disconnect();

    const candidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juanperez@example.com',
    };

    const response = await request(app)
      .post('/api/candidates')
      .send(candidateData)
      .expect(500);

    expect(response.body).toHaveProperty('error');

    // Reconectar para otros tests
    await prisma.$connect();
  });
});

describe('GET /api/candidates', () => {
  // Limpiar base de datos antes de cada test
  beforeEach(async () => {
    await prisma.candidate.deleteMany({});
  });

  // Cerrar conexión de Prisma después de todos los tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 200 with an array of candidates', async () => {
    // Crear algunos candidatos de prueba
    await prisma.candidate.createMany({
      data: [
        {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juanperez@example.com',
          phone: '3001234567',
          education: 'Ingeniería de Sistemas',
          experience: '3 años',
        },
        {
          firstName: 'María',
          lastName: 'González',
          email: 'mariagonzalez@example.com',
          phone: '3007654321',
          education: 'Administración',
          experience: '5 años',
        },
      ],
    });

    const response = await request(app)
      .get('/api/candidates')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('firstName');
    expect(response.body[0]).toHaveProperty('lastName');
    expect(response.body[0]).toHaveProperty('email');
  });

  it('should return empty array when no candidates exist', async () => {
    const response = await request(app)
      .get('/api/candidates')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return candidates ordered by createdAt DESC', async () => {
    // Crear candidatos con delay para asegurar diferentes timestamps
    const candidate1 = await prisma.candidate.create({
      data: {
        firstName: 'Primero',
        lastName: 'Candidato',
        email: 'primero@example.com',
      },
    });

    // Pequeño delay para asegurar diferentes timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const candidate2 = await prisma.candidate.create({
      data: {
        firstName: 'Segundo',
        lastName: 'Candidato',
        email: 'segundo@example.com',
      },
    });

    const response = await request(app)
      .get('/api/candidates')
      .expect(200);

    expect(response.body.length).toBe(2);
    // El más reciente debe estar primero
    expect(response.body[0].id).toBe(candidate2.id);
    expect(response.body[0].firstName).toBe('Segundo');
    expect(response.body[1].id).toBe(candidate1.id);
    expect(response.body[1].firstName).toBe('Primero');
  });

  it('should handle server errors gracefully', async () => {
    // Simular error de base de datos cerrando Prisma
    await prisma.$disconnect();

    const response = await request(app)
      .get('/api/candidates')
      .expect(500);

    expect(response.body).toHaveProperty('error');

    // Reconectar para otros tests
    await prisma.$connect();
  });
});

