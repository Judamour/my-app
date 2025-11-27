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

interface ApplicationAcceptedEmailProps {
  tenantName: string
  ownerName: string
  propertyTitle: string
  propertyAddress: string
  dashboardUrl: string
}

export default function ApplicationAcceptedEmail({
  tenantName = 'Locataire',
  ownerName = 'Jean Martin',
  propertyTitle = 'Appartement T2',
  propertyAddress = '12 rue de la République, 75001 Paris',
  dashboardUrl = 'http://localhost:3000/tenant',
}: ApplicationAcceptedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre candidature a été acceptée pour {propertyTitle} !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Candidature acceptée !</Heading>

          <Text style={text}>Bonjour {tenantName},</Text>
          
          <Text style={text}>
            Excellente nouvelle ! Votre candidature a été acceptée par le propriétaire.
          </Text>

          <Section style={propertyBox}>
            <Text style={propertyTitle}>🏠 {propertyTitle}</Text>
            <Text style={propertyAddress}>📍 {propertyAddress}</Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Propriétaire :</strong> {ownerName}
            </Text>
          </Section>

          <Text style={text}>
            Le propriétaire va maintenant créer le bail. Vous recevrez une notification dès qu&apos;il sera prêt à signer.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Voir mon tableau de bord
            </Button>
          </Section>

          <Text style={text}>
            En attendant, vous pouvez commencer à préparer les documents nécessaires :
          </Text>

          <Section style={checklistBox}>
            <Text style={checklistItem}>✓ Pièce d&apos;identité</Text>
            <Text style={checklistItem}>✓ Justificatif de revenus</Text>
            <Text style={checklistItem}>✓ Justificatif de domicile</Text>
            <Text style={checklistItem}>✓ Attestation d&apos;assurance habitation</Text>
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
  backgroundColor: '#ecfdf5',
  borderLeft: '4px solid #10b981',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
}

const propertyTitle = {
  color: '#065f46',
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

const checklistBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
}

const checklistItem = {
  color: '#92400e',
  fontSize: '14px',
  margin: '8px 0',
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