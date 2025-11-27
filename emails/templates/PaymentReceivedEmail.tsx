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

interface PaymentReceivedEmailProps {
  ownerName: string
  tenantName: string
  propertyTitle: string
  amount: number
  paymentDate: string
  paymentMonth: string
  paymentsUrl: string
}

export default function PaymentReceivedEmail({
  ownerName = 'Propriétaire',
  tenantName = 'Jean Dupont',
  propertyTitle = 'Appartement T2',
  amount = 850,
  paymentDate = '01/01/2024',
  paymentMonth = 'Janvier 2024',
  paymentsUrl = 'http://localhost:3000/owner/payments',
}: PaymentReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Paiement reçu de {tenantName} - {amount}€</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💰 Paiement reçu !</Heading>

          <Text style={text}>Bonjour {ownerName},</Text>
          
          <Text style={text}>
            Vous avez reçu un paiement de loyer pour votre propriété.
          </Text>

          <Section style={amountBox}>
            <Text style={amountText}>{amount}€</Text>
            <Text style={amountLabel}>Montant reçu</Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Locataire :</strong> {tenantName}
            </Text>
            <Text style={infoText}>
              <strong>Propriété :</strong> {propertyTitle}
            </Text>
            <Text style={infoText}>
              <strong>Période :</strong> {paymentMonth}
            </Text>
            <Text style={infoText}>
              <strong>Date de paiement :</strong> {paymentDate}
            </Text>
          </Section>

          <Text style={text}>
            Une quittance a été générée automatiquement et envoyée au locataire.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={paymentsUrl}>
              Voir tous les paiements
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

const amountBox = {
  backgroundColor: '#ecfdf5',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 40px',
  textAlign: 'center' as const,
}

const amountText = {
  color: '#065f46',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '0',
}

const amountLabel = {
  color: '#059669',
  fontSize: '14px',
  margin: '8px 0 0 0',
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