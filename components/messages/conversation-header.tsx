
// components/messages/conversation-header.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveConversation } from "@/actions/messages";
import { MoreVertical, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatar: string | null;
  role: string;
}

interface Participant {
  user: User;
}

interface Props {
  conversationId: string;
  participants: Participant[];
  subject?: string | null;
}

export default function ConversationHeader({ conversationId, participants, subject }: Props) {
  const router = useRouter();
  const otherParticipant = participants[0]?.user;

  const handleArchive = async () => {
    const result = await archiveConversation(conversationId);
    if (result.success) {
      toast.success("Conversation archived");
      router.push("/dashboard/messages");
    } else {
      toast.error(result.error || "Failed to archive conversation");
    }
  };

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherParticipant?.image || otherParticipant?.avatar || undefined} />
          <AvatarFallback>
            {otherParticipant?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {subject || otherParticipant?.name || "Unknown"}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">
            {otherParticipant?.role?.toLowerCase()}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}