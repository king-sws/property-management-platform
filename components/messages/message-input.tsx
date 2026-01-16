// components/messages/message-input.tsx
"use client";

import { useState, useRef, KeyboardEvent, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/actions/messages";
import { Send, Paperclip, Smile, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  conversationId: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  onReplyCanceled?: () => void;
}

export default function MessageInput({ conversationId, replyTo, onReplyCanceled }: Props) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  
  const MAX_CHARS = 5000;

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Save draft to localStorage
  useEffect(() => {
    if (message.trim()) {
      localStorage.setItem(`draft_${conversationId}`, message);
    } else {
      localStorage.removeItem(`draft_${conversationId}`);
    }
  }, [message, conversationId]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`draft_${conversationId}`);
    if (draft) {
      setMessage(draft);
    }
  }, [conversationId]);

  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting || message.length > MAX_CHARS) return;

    setIsSubmitting(true);
    try {
      const result = await sendMessage(
        conversationId,
        message.trim(),
        undefined,
        replyTo?.id
      );

      if (result.success) {
        setMessage("");
        setCharCount(0);
        localStorage.removeItem(`draft_${conversationId}`);
        if (onReplyCanceled) onReplyCanceled();
        router.refresh();
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred while sending the message");
      console.error("Message send error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Escape key to cancel reply
    if (e.key === "Escape" && replyTo && onReplyCanceled) {
      onReplyCanceled();
    }
  };

  const handleMessageChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="p-4">
        {replyTo && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg text-sm flex items-start justify-between gap-2 border border-border/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground mb-1">
                Replying to {replyTo.senderName}
              </p>
              <p className="text-muted-foreground truncate">
                {replyTo.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReplyCanceled}
              className="h-7 w-7 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-15 max-h-50 resize-none pr-20 transition-colors"
              disabled={isSubmitting}
              aria-label="Message input"
              aria-describedby="message-hint"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent"
                disabled={isSubmitting}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent"
                disabled={isSubmitting}
                aria-label="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting || isOverLimit}
            size="icon"
            className="h-15 w-15 shrink-0 transition-all hover:scale-105"
            aria-label="Send message"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p id="message-hint" className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Enter</kbd> to send
            {" • "}
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Shift + Enter</kbd> for new line
            {replyTo && (
              <>
                {" • "}
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Esc</kbd> to cancel reply
              </>
            )}
          </p>
          
          {charCount > 0 && (
            <p 
              className={`text-xs transition-colors ${
                isOverLimit 
                  ? "text-destructive font-medium" 
                  : isNearLimit 
                  ? "text-warning font-medium" 
                  : "text-muted-foreground"
              }`}
              role="status"
              aria-live="polite"
            >
              {charCount} / {MAX_CHARS}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}