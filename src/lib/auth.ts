import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only'

export interface JWTPayload {
  userId: string
  role: string
}

export const signToken = (payload: JWTPayload, expiresIn: any = '1d') => {
  return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions)
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}
