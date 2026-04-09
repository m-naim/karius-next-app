'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Headset, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import config from '@/services/config'
import http from '@/services/http'

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: Date
}

export default function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [userId, setUserId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const host = config.API_URL

  // Initialize session and history
  useEffect(() => {
    let storedId = localStorage.getItem('support_user_id')
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('support_user_id', storedId)
    }
    setUserId(storedId)

    const history = localStorage.getItem('support_chat_history')
    if (history) {
      setMessages(JSON.parse(history).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
    }
  }, [])

  // SSE connection for replies
  useEffect(() => {
    if (!userId) return

    const eventSource = new EventSource(`${host}/api/v1/support/stream?userId=${userId}`)

    eventSource.addEventListener('reply', (event) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: event.data,
        sender: 'admin',
        timestamp: new Date(),
      }
      setMessages((prev) => {
        const updated = [...prev, newMessage]
        localStorage.setItem('support_chat_history', JSON.stringify(updated))
        return updated
      })
    })

    return () => eventSource.close()
  }, [userId, host])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    localStorage.setItem('support_chat_history', JSON.stringify(updatedMessages))
    setInputValue('')

    try {
      await http.post(`${host}/api/v1/support/message`, {
        userId,
        message: inputValue,
      })
    } catch (error) {
      console.error('Failed to send support message', error)
    }
  }

  if (!userId) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <Card className="mb-4 w-[350px] overflow-hidden border-none shadow-2xl duration-300 animate-in slide-in-from-bottom-4 sm:w-[400px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-slate-900/10 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-primary/20">
                  <Headset className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-green-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Support Direct</CardTitle>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  En ligne
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="bg-slate-50 p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-[11px] italic text-slate-600">
                  Bonjour ! Posez votre question ici, nous vous répondrons directement sur ce chat.
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-1 text-sm shadow-sm ${
                        msg.sender === 'user'
                          ? 'rounded-tr-none bg-primary text-white'
                          : 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      <p className="m-0 p-0 leading-relaxed text-white">{msg.text}</p>
                      <span
                        className={`m-0 p-0 text-[9px] opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="h-10 flex-1 rounded-full border-slate-200 px-4 focus-visible:ring-primary"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full shadow-lg shadow-primary/20"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                Propulsé par BourseHorus Support
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'rotate-90 scale-90 bg-slate-900' : 'bg-primary hover:scale-110'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  )
}
