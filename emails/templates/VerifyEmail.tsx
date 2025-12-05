import * as React from 'react'

interface VerifyEmailProps {
  firstName: string
  verificationUrl: string
}

export default function VerifyEmail({
  firstName,
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', padding: '30px', borderRadius: '12px 12px 0 0', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>🏠 Renty</h1>
      </div>
      
      <div style={{ background: '#f9fafb', padding: '40px 30px', borderRadius: '0 0 12px 12px' }}>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>Bonjour {firstName} ! 👋</h2>
        
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>
          Bienvenue sur Renty ! Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
        </p>
        
        <div style={{ textAlign: 'center', margin: '35px 0' }}>
          <a 
            href={verificationUrl}
            style={{ 
              display: 'inline-block',
              background: '#3b82f6',
              color: 'white',
              padding: '14px 32px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            Vérifier mon email
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '30px' }}>
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
          <a href={verificationUrl} style={{ color: '#3b82f6', wordBreak: 'break-all' }}>
            {verificationUrl}
          </a>
        </p>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />
        
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
          Si vous n&apos;avez pas créé de compte sur Renty, ignorez cet email.
        </p>
      </div>
    </div>
  )
}