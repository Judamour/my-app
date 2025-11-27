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

interface NewMessageEmailProps {
  recipientName: string
  senderName: string
  messagePreview: string
  unreadCount?: number
  messagesUrl: string
}
export default function NewMessageEmail({
  recipientName = 'Utilisateur',
  senderName = 'Jean Dupont',
  messagePreview = 'Bonjour, j\'aimerais discuter...',
  unreadCount = 1,  // ✅ AJOUTÉ
  messagesUrl = 'http://localhost:3000/messages',
}: NewMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {unreadCount > 1 
          ? `${unreadCount} nouveaux messages` 
          : `Nouveau message de ${senderName}`
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💬 {unreadCount > 1 ? 'Nouveaux messages' : 'Nouveau message'}</Heading>

          <Text style={text}>Bonjour {recipientName},</Text>
          
          <Text style={text}>
            {unreadCount > 1 ? (
              <>Vous avez reçu <strong>{unreadCount} nouveaux messages</strong>.</>
            ) : (
              <>Vous avez reçu un nouveau message de <strong>{senderName}</strong>.</>
            )}
          </Text>

          {/* ✅ Afficher le preview seulement si 1 message */}
          {unreadCount === 1 && (
            <Section style={messageBox}>
              <Text style={messageText}>
                &quot;{messagePreview.length > 150 ? messagePreview.substring(0, 150) + '...' : messagePreview}&quot;
              </Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={messagesUrl}>
              {unreadCount > 1 ? 'Lire mes messages' : 'Lire et répondre'}
            </Button>
          </Section>

          <Text style={noteText}>
            💡 {unreadCount > 1 
              ? 'Plusieurs personnes attendent votre réponse !' 
              : 'Répondez rapidement pour maintenir une bonne communication !'
            }
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

const messageBox = {
  backgroundColor: '#f3f4f6',
  borderLeft: '4px solid #6366f1',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 40px',
}

const messageText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic',
  margin: '0',
}

const noteText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 40px',
  textAlign: 'center' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#6366f1',
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
