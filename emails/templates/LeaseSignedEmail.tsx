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

interface LeaseSignedEmailProps {
  recipientName: string
  recipientRole: 'owner' | 'tenant'
  propertyTitle: string
  propertyAddress: string
  startDate: string
  endDate: string
  monthlyRent: number
  leaseUrl: string
}

export default function LeaseSignedEmail({
  recipientName = 'Utilisateur',
  recipientRole = 'tenant',
  propertyTitle = 'Appartement T2',
  propertyAddress = '12 rue de la République, 75001 Paris',
  startDate = '01/01/2024',
  endDate = '31/12/2024',
  monthlyRent = 850,
  leaseUrl = 'http://localhost:3000/leases',
}: LeaseSignedEmailProps) {
  const isOwner = recipientRole === 'owner'

  return (
    <Html>
      <Head />
      <Preview>Bail signé pour {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📝 Bail signé avec succès !</Heading>

          <Text style={text}>Bonjour {recipientName},</Text>
          
          <Text style={text}>
            {isOwner 
              ? 'Le bail pour votre propriété a été signé et est maintenant actif.'
              : 'Votre bail a été signé et est maintenant actif. Félicitations pour votre nouveau logement !'
            }
          </Text>

          <Section style={propertyBox}>
            <Text style={propertyTitle}>🏠 {propertyTitle}</Text>
            <Text style={propertyAddress}>📍 {propertyAddress}</Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Période :</strong> Du {startDate} au {endDate}
            </Text>
            <Text style={infoText}>
              <strong>Loyer mensuel :</strong> {monthlyRent}€
            </Text>
          </Section>

          {isOwner ? (
            <Text style={text}>
              Vous recevrez une notification à chaque paiement de loyer. Les quittances seront générées automatiquement.
            </Text>
          ) : (
            <Text style={text}>
              N&apos;oubliez pas de régler votre loyer chaque mois. Vous recevrez une quittance automatiquement après chaque paiement.
            </Text>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={leaseUrl}>
              Consulter le bail
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

// Styles (mêmes que précédents)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  borderLeft: '4px solid #3b82f6',
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
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3b82f6',
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