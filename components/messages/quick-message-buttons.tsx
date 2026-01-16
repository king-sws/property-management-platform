// components/messages/quick-message-buttons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  messageMyLandlord,
  messageTenant,
  messageVendor,
  messageLandlordAboutTicket,
  messageAboutApplication,
} from "@/actions/quick-messages";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// -------------------------
// Message My Landlord Button
// Used by tenants on lease/property pages
// -------------------------
interface MessageLandlordButtonProps {
  propertyId: string;
  propertyName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function MessageLandlordButton({
  propertyId,
  propertyName,
  variant = "outline",
  size = "default",
}: MessageLandlordButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    const result = await messageMyLandlord(propertyId, message);

    if (result.success) {
      toast.success("Message sent!");
      setOpen(false);
      setMessage("");
      router.push(`/dashboard/messages/${result.data?.conversationId}`);
    } else {
      toast.error(result.error || "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message Landlord
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Your Landlord</DialogTitle>
            <DialogDescription>
              Send a message about {propertyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------------
// Message Tenant Button
// Used by landlords on property/lease management pages
// -------------------------
interface MessageTenantButtonProps {
  tenantId: string;
  tenantName: string;
  propertyName?: string;
  unitNumber?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function MessageTenantButton({
  tenantId,
  tenantName,
  propertyName,
  unitNumber,
  variant = "outline",
  size = "sm",
}: MessageTenantButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    const result = await messageTenant(
      tenantId,
      { propertyName, unitNumber },
      message
    );

    if (result.success) {
      toast.success("Message sent!");
      setOpen(false);
      setMessage("");
      router.push(`/dashboard/messages/${result.data?.conversationId}`);
    } else {
      toast.error(result.error || "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {tenantName}</DialogTitle>
            <DialogDescription>
              {propertyName && unitNumber
                ? `Regarding ${propertyName} - Unit ${unitNumber}`
                : propertyName
                ? `Regarding ${propertyName}`
                : "Send a message to your tenant"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------------
// Message Vendor Button
// Used by landlords on maintenance pages
// -------------------------
interface MessageVendorButtonProps {
  vendorId: string;
  vendorName: string;
  ticketId?: string;
  ticketTitle?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function MessageVendorButton({
  vendorId,
  vendorName,
  ticketId,
  ticketTitle,
  variant = "outline",
  size = "sm",
}: MessageVendorButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    const result = await messageVendor(vendorId, ticketId, message);

    if (result.success) {
      toast.success("Message sent!");
      setOpen(false);
      setMessage("");
      router.push(`/dashboard/messages/${result.data?.conversationId}`);
    } else {
      toast.error(result.error || "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message Vendor
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {vendorName}</DialogTitle>
            <DialogDescription>
              {ticketTitle ? `Regarding: ${ticketTitle}` : "Send a message to this vendor"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------------
// Message Landlord About Ticket Button
// Used by vendors on their ticket pages
// -------------------------
interface MessageLandlordAboutTicketButtonProps {
  ticketId: string;
  ticketTitle: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function MessageLandlordAboutTicketButton({
  ticketId,
  ticketTitle,
  variant = "outline",
  size = "default",
}: MessageLandlordAboutTicketButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    const result = await messageLandlordAboutTicket(ticketId, message);

    if (result.success) {
      toast.success("Message sent!");
      setOpen(false);
      setMessage("");
      router.push(`/dashboard/messages/${result.data?.conversationId}`);
    } else {
      toast.error(result.error || "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Contact Landlord
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Landlord</DialogTitle>
            <DialogDescription>Regarding: {ticketTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------------
// Message About Application Button
// Used by both tenants and landlords on application pages
// -------------------------
interface MessageAboutApplicationButtonProps {
  applicationId: string;
  recipientName: string;
  unitInfo: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function MessageAboutApplicationButton({
  applicationId,
  recipientName,
  unitInfo,
  variant = "outline",
  size = "default",
}: MessageAboutApplicationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    const result = await messageAboutApplication(applicationId, message);

    if (result.success) {
      toast.success("Message sent!");
      setOpen(false);
      setMessage("");
      router.push(`/dashboard/messages/${result.data?.conversationId}`);
    } else {
      toast.error(result.error || "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message {recipientName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {recipientName}</DialogTitle>
            <DialogDescription>Regarding application for {unitInfo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}