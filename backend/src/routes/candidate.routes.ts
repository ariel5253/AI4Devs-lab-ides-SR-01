import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { candidateRepository } from '../repositories/candidate.repository';

const router = Router();

// Configuración de multer para subida de archivos
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExts = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Esquema de validación Zod
const candidateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
});

/**
 * GET /api/candidates
 * Obtiene todos los candidatos ordenados por fecha de creación descendente
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidates = await candidateRepository.getAllCandidates();
      res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/candidates
 * Crea un nuevo candidato con opción de subir CV
 */
router.post(
  '/',
  upload.single('cv'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar datos del formulario
      const formData = candidateSchema.parse({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || undefined,
        address: req.body.address || undefined,
        education: req.body.education || undefined,
        experience: req.body.experience || undefined,
      });

      // Verificar si el email ya existe
      const existingCandidate = await candidateRepository.getCandidateByEmail(formData.email);
      if (existingCandidate) {
        // Si se subió un archivo, eliminarlo
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A candidate with this email already exists',
        });
      }

      // Construir URL del CV si se subió
      let cvUrl: string | undefined;
      if (req.file) {
        cvUrl = `/uploads/${req.file.filename}`;
      }

      // Crear candidato
      const candidate = await candidateRepository.createCandidate({
        ...formData,
        cvUrl,
      });

      res.status(201).json({
        message: 'Candidate created successfully',
        candidate,
      });
    } catch (error) {
      // Si hay error y se subió un archivo, eliminarlo
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

export default router;

