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

interface ReceiptGeneratedEmailProps {
  tenantName: string
  propertyTitle: string
  amount: number
  paymentMonth: string
  receiptUrl: string
}

export default function ReceiptGeneratedEmail({
  tenantName = 'Locataire',
  propertyTitle = 'Appartement T2',
  amount = 850,
  paymentMonth = 'Janvier 2024',
  receiptUrl = 'http://localhost:3000/tenant/receipts',
}: ReceiptGeneratedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre quittance de loyer pour {paymentMonth}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📄 Quittance de loyer</Heading>

          <Text style={text}>Bonjour {tenantName},</Text>
          
          <Text style={text}>
            Votre quittance de loyer a été générée et est maintenant disponible.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Propriété :</strong> {propertyTitle}
            </Text>
            <Text style={infoText}>
              <strong>Période :</strong> {paymentMonth}
            </Text>
            <Text style={infoText}>
              <strong>Montant :</strong> {amount}€
            </Text>
          </Section>

          <Text style={text}>
            Vous pouvez télécharger votre quittance au format PDF à tout moment depuis votre espace locataire.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={receiptUrl}>
              Télécharger la quittance
            </Button>
          </Section>

          <Text style={noteText}>
            💡 <strong>Conseil :</strong> Conservez toutes vos quittances, elles peuvent être utiles pour vos démarches administratives.
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

const infoBox = {
  backgroundColor: '#eff6ff',
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