import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface NewApplicationEmailProps {
  ownerName: string
  tenantName: string
  propertyTitle: string
  propertyAddress: string
  applicationUrl: string
}

export default function NewApplicationEmail({
  ownerName = 'Propriétaire',
  tenantName = 'Jean Dupont',
  propertyTitle = 'Appartement T2',
  propertyAddress = '12 rue de la République, 75001 Paris',
  applicationUrl = 'http://localhost:3000/owner/applications',
}: NewApplicationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle candidature pour {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📩 Nouvelle candidature !</Heading>

          <Text style={text}>Bonjour {ownerName},</Text>
          
          <Text style={text}>
            Bonne nouvelle ! Vous avez reçu une nouvelle candidature pour votre propriété.
          </Text>

          <Section style={propertyBox}>
            <Text style={propertyTitle}>🏠 {propertyTitle}</Text>
            <Text style={propertyAddress}>📍 {propertyAddress}</Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Candidat :</strong> {tenantName}
            </Text>
          </Section>

          <Text style={text}>
            Consultez le profil du candidat et répondez rapidement pour maximiser vos chances de conclure.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={applicationUrl}>
              Voir la candidature
            </Button>
          </Section>

          <Text style={footer}>
            © 2024 RentEasy. Tous droits réservés.
            <br />
            <Link href="http://localhost:3000" style={link}>
              Accéder à la plateforme
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
}

const propertyBox = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #2563eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
}

const propertyTitle = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const propertyAddress = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
}

const infoText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 40px 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}