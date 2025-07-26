// Jest setup file for test configuration
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for tests
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: {
          create: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        board: {
          create: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };
    }),
  };
});

// Global test timeout
jest.setTimeout(30000);

// Suppress console errors during tests
global.console.error = jest.fn();