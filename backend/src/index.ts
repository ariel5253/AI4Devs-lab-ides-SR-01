// Este archivo se mantiene para compatibilidad con código existente
// La aplicación principal está en app.ts y server.ts
import { app } from './app';
import prisma from './lib/prisma';

export { app };
export default prisma;
