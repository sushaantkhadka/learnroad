"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface Message {
  _id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  senderName: string
  receiverName: string
}

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  timestamp: Date
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`)
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
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage,
        }),
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages([...messages, sentMessage])
        setNewMessage("")
        // Update the conversation list
        const updatedConversations = conversations.map((conv) =>
          conv.userId === selectedConversation ? { ...conv, lastMessage: newMessage, timestamp: new Date() } : conv,
        )
        setConversations(updatedConversations)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  className={`flex items-center p-4 cursor-pointer hover:bg-secondary ${
                    selectedConversation === conversation.userId ? "bg-secondary" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation.userId)}
                >
                  <Avatar className="w-10 h-10 mr-4">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{conversation.userName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConversation
                ? conversations.find((c) => c.userId === selectedConversation)?.userName
                : "Select a conversation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] mb-4">
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
                        {message.senderId === session?.user?.id ? session.user.name?.[0] : message.senderName[0]}
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
              <Button type="submit" size="icon" disabled={!selectedConversation}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

