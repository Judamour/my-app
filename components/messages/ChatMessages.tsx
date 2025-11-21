'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
//import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  content: string
  createdAt: Date
  senderId: string
  sender: {
    id: string
    firstName: string
    lastName: string
  }
}

interface ChatMessagesProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

export default function ChatMessages({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 🔴 SUPABASE REALTIME
  // 🔄 POLLING OPTIMISÉ (seulement quand l'onglet est actif)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`
        )
        const data = await response.json()

        if (data.data) {
          // Comparer le dernier message ID pour éviter les re-renders inutiles
          const lastNewId = data.data[data.data.length - 1]?.id
          const lastCurrentId = messages[messages.length - 1]?.id

          if (lastNewId !== lastCurrentId) {
            setMessages(data.data)
          }
        }
      } catch (error) {
        console.error('Erreur fetch messages:', error)
      }
    }

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(fetchMessages, 3000)
      }
    }

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    // Démarrer le polling
    startPolling()

    // Arrêter quand l'onglet n'est pas visible
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchMessages() // Refresh immédiat au retour
        startPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [conversationId , messages])
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)

    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier'
    }

    return messageDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year:
        messageDate.getFullYear() !== today.getFullYear()
          ? 'numeric'
          : undefined,
    })
  }

  // Grouper les messages par jour
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: newMessage.trim(),
      createdAt: new Date(),
      senderId: currentUserId,
      sender: { id: currentUserId, firstName: '', lastName: '' },
    }

    // Optimistic update
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: tempMessage.content }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      // Remplacer le message temporaire par le vrai
      setMessages(prev => prev.map(m => (m.id === tempId ? data.data : m)))
    } catch (error) {
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error("Erreur lors de l'envoi du message")
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👋</span>
              </div>
              <p className="text-gray-900">Envoyez votre premier message !</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map(message => {
                    const isMe = message.senderId === currentUserId

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                            isMe
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            <div className="text-gray-900 flex-1 relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                rows={1}
                className="text-gray-900  w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {sending ? (
                <span className="animate-spin block w-5 h-5">⏳</span>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
