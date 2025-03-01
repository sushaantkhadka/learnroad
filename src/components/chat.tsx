"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

interface Message {
  _id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
}

interface ChatProps {
  recipientId: string
  recipientName: string
}

export function Chat({ recipientId, recipientName }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?recipientId=${recipientId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          content: newMessage,
        }),
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages([...messages, sentMessage])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chat with {recipientName}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] mb-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex mb-4 ${message.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start ${
                  message.senderId === session?.user?.id ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {message.senderId === session?.user?.id ? session.user.name?.[0] : recipientName[0]}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`mx-2 p-3 rounded-lg ${
                    message.senderId === session?.user?.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={sendMessage} className="flex items-center">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow mr-2"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

