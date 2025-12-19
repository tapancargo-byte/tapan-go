"use client"

import { DialogClose, DialogContent } from "@/components/ui/dialog"
import { Component as AiAssistantCard } from "@/components/ui/ai-assistant-card"

export function ChatDrawer() {
  return (
    <DialogContent className="p-0 sm:max-w-3xl" showCloseButton={false}>
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-4">
        <AiAssistantCard
          className="mx-auto"
          wrapCloseButton={(button) => <DialogClose asChild>{button}</DialogClose>}
        />
      </div>
    </DialogContent>
  )
}

export default ChatDrawer
