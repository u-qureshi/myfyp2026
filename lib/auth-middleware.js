import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'timetable-ai-secret-key'

/**
 * Verify JWT token from Authorization header
 * Returns decoded token or null
 */
export function verifyToken(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return null
  }
}

/**
 * Extract user ID from JWT token
 */
export function getUserIdFromRequest(request) {
  const decoded = verifyToken(request)
  return decoded?.id || null
}

/**
 * Middleware to protect routes - returns 401 if no valid token
 */
export function withAuth(handler) {
  return async (request) => {
    const decoded = verifyToken(request)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Attach user info to request
    request.user = decoded

    return handler(request)
  }
}

/**
 * Create JWT token
 */
export function createToken(userId, email, role = 'user') {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}
