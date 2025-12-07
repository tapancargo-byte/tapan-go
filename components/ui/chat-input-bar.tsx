"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAutoResizeTextarea } from "@/components/ui/use-auto-resize-textarea";
import { cn } from "@/lib/utils";
import { ArrowUp, Paperclip } from "lucide-react";

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  /**
   * Optional callback fired when the user selects files via the attachment button.
   * If omitted, the attachment button will still open the file picker but files
   * will not be propagated to a parent component.
   */
  onAttach?: (files: FileList | null) => void;
}

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  isLoading,
  minHeight = 44,
  maxHeight = 120,
  className,
  onAttach,
}: ChatInputBarProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || isLoading) return;
      onSubmit();
      adjustHeight(true);
    }
  };

  const handleClickSend = () => {
    if (!value.trim() || isLoading) return;
    onSubmit();
    adjustHeight(true);
  };

  const handleAttachClick = () => {
    if (isLoading) return;
    if (!fileInputRef.current) return;
    // Reset so selecting the same file twice still triggers a change event
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (onAttach) {
      onAttach(files && files.length > 0 ? files : null);
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-sm resize-none flex-1 min-h-[44px] max-h-[160px]"
            style={{ overflow: "hidden" }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-9 w-9 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
            onClick={handleAttachClick}
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <Button
          type="button"
          size="icon"
          disabled={!value.trim() || !!isLoading}
          className={cn(
            "h-10 w-10 shrink-0",
            value.trim() && !isLoading
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground hover:bg-muted"
          )}
          onClick={handleClickSend}
        >
          {isLoading ? (
            <span className="text-[11px]">...</span>
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
