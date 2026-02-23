import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only'

export interface JWTPayload {
  userId: string
  role: string
}

export const signToken = (payload: JWTPayload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}
