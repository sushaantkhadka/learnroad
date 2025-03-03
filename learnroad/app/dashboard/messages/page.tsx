"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send } from "lucide-react"

interface Message {
  _id: string
  senderId: {
    _id: string
    name: string
    profileImage: string
  }
  receiverId: {
    _id: string
    name: string
    profileImage: string
  }
  content: string
  createdAt: string
}

export default function MessagesPage() {
  const { data: authSession } = useSession()
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({})
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/messages")
        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }
        const data = await response.json()

        // Group messages by conversation
        const groupedConversations: { [key: string]: Message[] } = {}
        data.forEach((message: Message) => {
          const otherUserId =
            message.senderId._id === authSession?.user?.id ? message.receiverId._id : message.senderId._id
          if (!groupedConversations[otherUserId]) {
            groupedConversations[otherUserId] = []
          }
          groupedConversations[otherUserId].push(message)
        })

        // Sort conversations by the most recent message
        Object.keys(groupedConversations).forEach((userId) => {
          groupedConversations[userId].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        })

        setConversations(groupedConversations)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (authSession) {
      fetchConversations()
    }
  }, [authSession, toast])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedUser,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const sentMessage = await response.json()
      setConversations((prev) => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), sentMessage],
      }))
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Message failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (selectedUser) {
      const messageContainer = document.getElementById("message-container")
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight
      }
    }
  }, [selectedUser])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <div className="flex h-[calc(100vh-200px)]">
          <Card className="w-1/3 mr-4">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(conversations).map(([userId, messages]) => {
                const otherUser =
                  messages[0].senderId._id === authSession?.user?.id ? messages[0].receiverId : messages[0].senderId
                return (
                  <Button
                    key={userId}
                    variant={selectedUser === userId ? "default" : "ghost"}
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedUser(userId)}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                      <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span>{otherUser.name}</span>
                      <span className="text-xs text-muted-foreground">{messages[0].content.substring(0, 20)}...</span>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>
                {selectedUser
                  ? conversations[selectedUser][0].senderId._id === authSession?.user?.id
                    ? conversations[selectedUser][0].receiverId.name
                    : conversations[selectedUser][0].senderId.name
                  : "Select a conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-120px)]">
              {selectedUser && (
                <>
                  <div id="message-container" className="flex-1 overflow-y-auto mb-4 flex flex-col-reverse">
                    {conversations[selectedUser].map((message) => (
                      <div
                        key={message._id}
                        className={`flex mb-2 ${
                          message.senderId._id === authSession?.user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            message.senderId._id === authSession?.user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 mr-2"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

