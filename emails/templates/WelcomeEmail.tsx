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

interface WelcomeEmailProps {
  userName: string
  userEmail: string
  loginUrl: string
}

export default function WelcomeEmail({
  userName = 'Utilisateur',
  userEmail = 'user@example.com',
  loginUrl = 'http://localhost:3000/login',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur RentEasy ! Votre compte a été créé avec succès.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo / Header */}
          <Heading style={h1}>🏠 Bienvenue sur RentEasy !</Heading>

          {/* Content */}
          <Text style={text}>Bonjour {userName},</Text>
          
          <Text style={text}>
            Votre compte a été créé avec succès ! Nous sommes ravis de vous compter parmi nous.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Email :</strong> {userEmail}
            </Text>
          </Section>

          <Text style={text}>
            Vous pouvez maintenant vous connecter et commencer à utiliser la plateforme :
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Se connecter
            </Button>
          </Section>

          <Text style={text}>
            Si vous avez des questions, n&apos;hésitez pas à nous contacter.
          </Text>

          {/* Footer */}
          <Text style={footer}>
            © 2024 RentEasy. Tous droits réservés.
            <br />
            <Link href="http://localhost:3000" style={link}>
              Visiter le site
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
  backgroundColor: '#2563eb',
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