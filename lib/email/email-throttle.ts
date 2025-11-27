import { prisma } from '@/lib/prisma'

/**
 * Vérifie si on peut envoyer un email de nouveau message à un utilisateur
 * Limite : 1 email par 24 heures
 */
export async function canSendMessageEmail(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastMessageEmailSent: true },
  })

  if (!user) return false

  // Si jamais envoyé, OK
  if (!user.lastMessageEmailSent) return true

  // Vérifier si plus de 24h se sont écoulées
  const now = new Date()
  const lastSent = new Date(user.lastMessageEmailSent)
  const hoursSinceLastEmail = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)

  return hoursSinceLastEmail >= 24
}

/**
 * Met à jour le timestamp du dernier email envoyé
 */
export async function markMessageEmailSent(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastMessageEmailSent: new Date() },
  })
}

/**
 * Compte le nombre de messages non lus depuis le dernier email
 */
export async function getUnreadMessagesSinceLastEmail(
  userId: string
): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastMessageEmailSent: true },
  })

  if (!user) return 0

  const messages = await prisma.message.count({
    where: {
      recipientId: userId,
      read: false,
      createdAt: {
        gt: user.lastMessageEmailSent || new Date(0), // Depuis dernier email ou depuis toujours
      },
    },
  })

  return messages
}