import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { CHAT_API_BASE_URL, CHAT_SOCKET_PATH, CHAT_SOCKET_URL } from '../core/constants/api.constants';
import { ChatConversation, ChatMessage, ChatUser } from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket?: Socket;

  constructor(private readonly http: HttpClient) {}

  getConversations(userId: string): Observable<ChatConversation[]> {
    return this.http.get<ChatConversation[]>(`${CHAT_API_BASE_URL}/conversations`, {
      params: { userId }
    });
  }

  createConversation(userA: string, userB: string): Observable<ChatConversation> {
    return this.http.post<ChatConversation>(`${CHAT_API_BASE_URL}/conversations`, {
      userA,
      userB
    });
  }

  getUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${CHAT_API_BASE_URL}/users`);
  }

  getActiveUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${CHAT_API_BASE_URL}/users/active`);
  }

  getUserById(id: string): Observable<ChatUser> {
    return this.http.get<ChatUser>(`${CHAT_API_BASE_URL}/users/${id}`);
  }

  getUserByEmail(email: string): Observable<ChatUser> {
    return this.http.get<ChatUser>(`${CHAT_API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(CHAT_SOCKET_URL, {
        path: CHAT_SOCKET_PATH,
        transports: ['websocket', 'polling'],
        withCredentials: true
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = undefined;
  }

  joinConversation(conversationId: string): void {
    this.connect().emit('joinConversation', { conversationId });
  }

  loadMessages(conversationId: string): void {
    this.connect().emit('loadMessages', { conversationId });
  }

  sendMessage(content: string, sender: 'client' | 'freelancer', conversationId: string, senderId: string): void {
    this.connect().emit('sendMessage', {
      content,
      sender,
      conversationId,
      senderId
    });
  }

  updateMessage(id: string, content: string, actorId: string, conversationId: string): void {
    this.connect().emit('updateMessage', {
      id,
      content,
      actorId,
      conversationId
    });
  }

  deleteMessage(id: string, actorId: string, conversationId: string): void {
    this.connect().emit('deleteMessage', {
      id,
      actorId,
      conversationId
    });
  }

  sortMessages(messages: ChatMessage[]): ChatMessage[] {
    return [...messages].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  }
}
