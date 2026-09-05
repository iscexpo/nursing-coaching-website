import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(
  message: string,
  status = 500,
  code: ApiErrorCode = 'INTERNAL_ERROR',
) {
  return NextResponse.json({ error: message, code }, { status })
}

export const badRequest = (message = 'Bad request') =>
  fail(message, 400, 'BAD_REQUEST')

export const validationError = (
  message = 'Invalid input',
  details?: unknown,
) => {
  return NextResponse.json(
    { error: message, code: 'VALIDATION_ERROR' as const, details },
    { status: 400 },
  )
}

export const unauthorized = (message = 'Unauthorized') =>
  fail(message, 401, 'UNAUTHORIZED')

export const forbidden = (message = 'Forbidden') =>
  fail(message, 403, 'FORBIDDEN')

export const notFound = (message = 'Not found') =>
  fail(message, 404, 'NOT_FOUND')

export const conflict = (message = 'Conflict') => fail(message, 409, 'CONFLICT')

export const rateLimited = (message = 'Too many requests') =>
  fail(message, 429, 'RATE_LIMITED')

export const serverError = (message = 'Internal server error') =>
  fail(message, 500, 'INTERNAL_ERROR')
