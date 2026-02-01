// components/messages/message-input.tsx
"use client";

import { useState, useRef, KeyboardEvent, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/actions/messages";
import { Send, Paperclip, Smile, Loader2, X, Image as ImageIcon } from "lucide-react";
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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  
  const MAX_CHARS = 5000;

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
      textarea.style.height = `${newHeight}px`;
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

  // Save draft to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (message.trim()) {
        localStorage.setItem(`draft_${conversationId}`, message);
      } else {
        localStorage.removeItem(`draft_${conversationId}`);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
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
          textareaRef.current.style.height = "44px";
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
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Cancel reply on Escape
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
  const canSend = message.trim() && !isSubmitting && !isOverLimit;

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 space-y-3">
        {/* Reply Preview */}
        {replyTo && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground mb-1">
                Replying to {replyTo.senderName}
              </p>
              <p className="text-muted-foreground line-clamp-2">
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

        {/* Input Container */}
        <div className={`relative rounded-lg border transition-all ${
          isFocused 
            ? "ring-2 ring-ring ring-offset-2 ring-offset-background border-primary" 
            : "border-input"
        }`}>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-24 py-3 bg-transparent"
            disabled={isSubmitting}
            aria-label="Message input"
            aria-describedby="message-hint"
          />
          
          {/* Action Buttons - Inside Input */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              disabled={isSubmitting}
              aria-label="Attach file"
              title="Attach file (coming soon)"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              disabled={isSubmitting}
              aria-label="Add image"
              title="Add image (coming soon)"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              disabled={isSubmitting}
              aria-label="Add emoji"
              title="Add emoji (coming soon)"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer: Hints & Send Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Keyboard Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono">↵</kbd>
                <span className="hidden sm:inline">to send</span>
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono">⇧</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono">↵</kbd>
                <span>for new line</span>
              </span>
              {replyTo && (
                <span className="hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono">Esc</kbd>
                  <span>to cancel</span>
                </span>
              )}
            </div>

            {/* Character Count */}
            {charCount > 0 && (
              <p 
                className={`text-xs mt-1 transition-colors ${
                  isOverLimit 
                    ? "text-destructive font-medium" 
                    : isNearLimit 
                    ? "text-orange-500 font-medium" 
                    : "text-muted-foreground"
                }`}
                role="status"
                aria-live="polite"
              >
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                {isOverLimit && " (limit exceeded)"}
              </p>
            )}
          </div>
          
          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSend}
            size="default"
            className="shrink-0 transition-all hover:scale-105"
            aria-label="Send message"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}