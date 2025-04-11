"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, Paperclip, Sparkles } from "lucide-react"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI research assistant. How can I help with your research today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Format messages for the API (omitting timestamp and id which API doesn't need)
      const apiMessages = messages
        .concat(userMessage)
        .filter(msg => msg.role !== "system") // Filter out system messages as we'll add them in the API
        .map(({ content, role }) => ({ content, role }));

      // Call our chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          chatId
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Save chat ID for future messages
      if (data.chatId && !chatId) {
        setChatId(data.chatId);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message.content,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat API error:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setChatId(null);
    setMessages([
      {
        id: "1",
        content: "Hello! I'm your AI research assistant. How can I help with your research today?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">AI Research Assistant</h1>
          <p className="text-muted-foreground">Ask questions about papers, get explanations, and research guidance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <FileText className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Suggested Prompts
          </Button>
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-0 flex flex-col h-full">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-[80%] items-start gap-3 rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-start gap-3 rounded-lg bg-muted p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <LoadingIndicator variant="pulse" text="" className="py-0" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Input
                placeholder="Ask about research papers, concepts, or request summaries..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              AI responses are generated using GPT-3.5 and based on available research data. Always verify information for critical research.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
