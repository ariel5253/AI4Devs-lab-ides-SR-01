import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export type CandidateCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  experience?: string;
  cvUrl?: string;
};

export const candidateRepository = {
  /**
   * Crea un nuevo candidato en la base de datos
   */
  async createCandidate(data: CandidateCreateInput) {
    return prisma.candidate.create({
      data,
    });
  },

  /**
   * Busca un candidato por email
   */
  async getCandidateByEmail(email: string) {
    return prisma.candidate.findUnique({
      where: { email },
    });
  },

  /**
   * Obtiene todos los candidatos ordenados por fecha de creación descendente
   */
  async getAllCandidates() {
    return prisma.candidate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
};

