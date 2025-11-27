import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Configuration par défaut
export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'RentEasy'
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'