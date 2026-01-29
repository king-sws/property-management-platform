'use client'

import { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'

export default function ChatPage() {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('')
    }
  }

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Live Chat Support
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Chat with our support team in real-time
          </p>
        </div>

        {/* Chat Container */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-border p-4 bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">CS</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Customer Support</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-background">
            {/* Support Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium">CS</span>
              </div>
              <div className="flex-1">
                <div className="bg-muted/40 rounded-lg p-3 max-w-md">
                  <p className="text-sm">
                    Hi! Welcome to Propely support. How can I help you today?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">2:34 PM</p>
              </div>
            </div>

            {/* User Message Example */}
            <div className="flex gap-3 justify-end">
              <div className="flex-1 flex flex-col items-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-md">
                  <p className="text-sm">
                    I need help setting up my first property.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">2:35 PM</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-primary-foreground">You</span>
              </div>
            </div>

            {/* Support Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium">CS</span>
              </div>
              <div className="flex-1">
                <div className="bg-muted/40 rounded-lg p-3 max-w-md">
                  <p className="text-sm">
                    I&#39;d be happy to help you with that! Adding your first property is easy. Would you like me to walk you through the steps?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">2:35 PM</p>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium">CS</span>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-4 bg-background">
            <div className="flex items-end gap-2">
              <button className="p-2 hover:bg-muted/40 rounded-lg transition">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <button className="p-2 hover:bg-muted/40 rounded-lg transition">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={handleSend}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Average response time: <strong>under 2 minutes</strong> • Available Mon-Fri, 9am-6pm EST
          </p>
        </div>

      </div>
    </section>
  )
}