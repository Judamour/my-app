import { resend, EMAIL_FROM, EMAIL_FROM_NAME } from './resend'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
}

/**
 * Envoie un email via Resend
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const data = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    })

    console.log('✅ Email sent:', { to, subject, id: data.id })
    return { success: true, data }
  } catch (error) {
    console.error('❌ Email error:', error)
    return { success: false, error }
  }
}

/**
 * Envoie un email en batch (plusieurs destinataires)
 */
export async function sendBatchEmails(emails: SendEmailOptions[]) {
  try {
    const promises = emails.map((email) => sendEmail(email))
    const results = await Promise.allSettled(promises)
    
    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length
    
    console.log(`✅ Batch emails sent: ${successful} success, ${failed} failed`)
    return { successful, failed }
  } catch (error) {
    console.error('❌ Batch email error:', error)
    return { successful: 0, failed: emails.length }
  }
}