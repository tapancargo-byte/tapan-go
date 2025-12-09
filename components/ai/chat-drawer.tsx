"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

export function ChatDrawer({ onClose }: { onClose?: () => void }) {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })
  const [text, setText] = React.useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    await sendMessage({ text: value })
    setText("")
  }

  function renderMessageContent(m: any) {
    if (typeof m.content === "string") return m.content
    if (Array.isArray(m.parts)) {
      const texts = m.parts
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .filter(Boolean)
      return texts.join("\n")
    }
    return ""
  }

  const isBusy = status !== "ready"

  return (
    <DrawerContent className="h-[80vh] lg:h-[70vh]">
      <DrawerHeader>
        <DrawerTitle>AI Assistant</DrawerTitle>
        <DrawerDescription>Ask questions about shipments, customers, invoices, and operations.</DrawerDescription>
      </DrawerHeader>
      <div className="px-4">
        <div className={cn("rounded-lg border bg-card")}>
          <ScrollArea className="h-[48vh] p-4">
            <div className="flex flex-col gap-3">
              {messages.map((m: any) => (
                <div key={m.id} className={cn("rounded-md px-3 py-2 text-sm", m.role === "user" ? "bg-accent" : "bg-muted")}>
                  <div className="text-xs mb-1 text-muted-foreground">{m.role === "user" ? "You" : "Assistant"}</div>
                  <div className="whitespace-pre-wrap">{renderMessageContent(m)}</div>
                </div>
              ))}
              {error && (
                <div className="text-sm text-destructive">{String((error as any)?.message || error)}</div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your question..."
              className="flex-1"
              disabled={isBusy}
            />
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
      <DrawerFooter>
        <div className="text-xs text-muted-foreground">
          Powered by your /api/chat route. Keep sensitive data safe; no secrets are sent to the client.
        </div>
      </DrawerFooter>
    </DrawerContent>
  )
}

export default ChatDrawer
