// lib/errors.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non authentifié') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accès interdit') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} non trouvé(e)`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

// Wrapper pour gérer toutes les erreurs
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation échouée',
        code: 'VALIDATION_ERROR',
details: error.issues
      },
      { status: 400 }
    )
  }
  
  // Erreur inconnue
  return NextResponse.json(
    {
      error: 'Erreur serveur interne',
      code: 'INTERNAL_SERVER_ERROR'
    },
    { status: 500 }
  )
}