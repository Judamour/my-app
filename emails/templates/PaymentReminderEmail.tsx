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

interface PaymentReminderEmailProps {
  tenantName: string
  propertyTitle: string
  amount: number
  dueDate: string
  daysOverdue: number
  paymentUrl: string
}

export default function PaymentReminderEmail({
  tenantName = 'Locataire',
  propertyTitle = 'Appartement T2',
  amount = 850,
  dueDate = '01/01/2024',
  daysOverdue = 5,
  paymentUrl = 'http://localhost:3000/tenant/payments',
}: PaymentReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Rappel : Loyer impayé pour {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Rappel de paiement</Heading>

          <Text style={text}>Bonjour {tenantName},</Text>
          
          <Text style={text}>
            Nous vous rappelons que votre loyer n&apos;a pas encore été réglé.
          </Text>

          <Section style={warningBox}>
            <Text style={warningTitle}>Paiement en retard</Text>
            <Text style={warningText}>
              {daysOverdue} jour{daysOverdue > 1 ? 's' : ''} de retard
            </Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Propriété :</strong> {propertyTitle}
            </Text>
            <Text style={infoText}>
              <strong>Montant dû :</strong> {amount}€
            </Text>
            <Text style={infoText}>
              <strong>Date d&apos;échéance :</strong> {dueDate}
            </Text>
          </Section>

          <Text style={text}>
            Veuillez régulariser votre situation dans les plus brefs délais pour éviter tout désagrément.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={paymentUrl}>
              Effectuer le paiement
            </Button>
          </Section>

          <Text style={noteText}>
            Si vous rencontrez des difficultés, n&apos;hésitez pas à contacter votre propriétaire pour trouver une solution.
          </Text>

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

const warningBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #ef4444',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 40px',
  textAlign: 'center' as const,
}

const warningTitle = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const warningText = {
  color: '#dc2626',
  fontSize: '16px',
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

const noteText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 40px',
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#ef4444',
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