/* eslint-disable @typescript-eslint/no-unused-vars */
// components/messages/new-conversation-button.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createConversation, getAvailableContacts } from "@/actions/messages";
import { MessageSquarePlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatar: string | null;
  role: string;
}

export default function NewConversationButton() {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadContacts();
    } else {
      // Reset state when dialog closes
      setSelectedContact(null);
      setSubject("");
      setMessage("");
      setSearchQuery("");
    }
  }, [open]);

  const loadContacts = async () => {
    setIsLoading(true);
    const result = await getAvailableContacts();
    if (result.success) {
      setContacts(result.data?.contacts || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedContact || !message.trim()) {
      toast.error("Please select a contact and enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createConversation(
        [selectedContact.id],
        subject.trim() || undefined,
        message.trim()
      );

      if (result.success) {
        toast.success("Message sent successfully");
        setOpen(false);
        router.push(`/dashboard/messages/${result.data.conversationId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create conversation");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <MessageSquarePlus className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-137.5 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">New Message</DialogTitle>
          <DialogDescription>
            Start a conversation with a tenant, landlord, or vendor
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Contact Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">To</Label>
            
            {selectedContact ? (
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                "bg-primary/5 border-primary"
              )}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                    <AvatarImage 
                      src={selectedContact.image || selectedContact.avatar || undefined} 
                    />
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                      {selectedContact.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">
                      {selectedContact.name || selectedContact.email}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-2 py-0 h-4 capitalize mt-0.5"
                    >
                      {selectedContact.role.toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedContact(null)}
                  className="hover:bg-background"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
                
                <div className="border rounded-xl overflow-hidden">
                  <ScrollArea className="h-70">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          No contacts found
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {filteredContacts.map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left group"
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-background group-hover:ring-accent-foreground/20 transition-all">
                              <AvatarImage 
                                src={contact.image || contact.avatar || undefined} 
                              />
                              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                {contact.name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {contact.name || contact.email}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge 
                                  variant="secondary" 
                                  className="text-[10px] px-2 py-0 h-4 capitalize"
                                >
                                  {contact.role.toLowerCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground truncate">
                                  {contact.email}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>

          {/* Subject (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold">
              Subject <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="subject"
              placeholder="What's this about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-30 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedContact || !message.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquarePlus className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}