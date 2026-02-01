/* eslint-disable @typescript-eslint/no-explicit-any */
// components/properties/contact-landlord-button.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createConversation } from "@/actions/messages";

interface ContactLandlordButtonProps {
  landlordId: string;
  propertyName: string;
  propertyId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

export function ContactLandlordButton({
  landlordId,
  propertyName,
  propertyId,
  variant = "outline",
  size = "lg",
  showIcon = true,
  className,
}: ContactLandlordButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createConversation(
          [landlordId],
          `Property: ${propertyName}`,
          message
        );

        if (result.success && result.data?.conversationId) {
          toast.success("Message sent successfully!");
          setIsOpen(false);
          setMessage("");
          // Redirect to the conversation
          router.push(`/dashboard/messages/${result.data.conversationId}`);
        } else {
          toast.error(result.error || "Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {showIcon && <MessageCircle className="mr-2 h-4 w-4" />}
        Contact
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Property Manager</DialogTitle>
            <DialogDescription>
              Send a message to the property manager for {propertyName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Your Message
              </label>
              <Textarea
                id="message"
                placeholder="Hi, I'm interested in this property and would like to know more about..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                This will start a conversation with the property manager.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isPending || !message.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}