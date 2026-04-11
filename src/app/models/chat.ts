export interface ChatConversation {
  _id: string;
  participants: string[];
  lastMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  content: string;
  sender: 'client' | 'freelancer';
  socketId?: string;
  edited: boolean;
  conversationId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
}
