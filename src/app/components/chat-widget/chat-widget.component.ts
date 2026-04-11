import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatConversation, ChatMessage, ChatUser } from '../../models/chat';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  canShowWidget = false;
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentUser: ChatUser | null = null;
  conversations: ChatConversation[] = [];
  users: ChatUser[] = [];
  selectedConversation: ChatConversation | null = null;
  messages: ChatMessage[] = [];
  messageText = '';
  editingMessageId: string | null = null;
  editingText = '';

  private socket: Socket | null = null;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.canShowWidget = true;
    this.initializeChat();
  }

  ngOnDestroy(): void {
    this.cleanupSocketListeners();
    this.chatService.disconnect();
    this.subscriptions.unsubscribe();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen && this.currentUser && this.conversations.length === 0 && !this.isLoading) {
      this.loadConversations();
    }
  }

  selectConversation(conversation: ChatConversation): void {
    this.selectedConversation = conversation;
    this.messages = [];
    this.editingMessageId = null;
    this.editingText = '';
    this.errorMessage = '';

    this.chatService.joinConversation(conversation._id);
    this.chatService.loadMessages(conversation._id);
  }

  startConversation(user: ChatUser): void {
    if (!this.currentUser || user._id === this.currentUser._id) {
      return;
    }

    this.errorMessage = '';
    this.subscriptions.add(
      this.chatService.createConversation(this.currentUser._id, user._id).subscribe({
        next: (conversation) => {
          this.upsertConversation(conversation);
          this.selectConversation(conversation);
        },
        error: () => {
          this.errorMessage = 'Conversation indisponible.';
        }
      })
    );
  }

  sendMessage(): void {
    const content = this.messageText.trim();
    if (!content || !this.currentUser || !this.selectedConversation) {
      return;
    }

    this.chatService.sendMessage(
      content,
      this.getSenderType(),
      this.selectedConversation._id,
      this.currentUser._id
    );
    this.messageText = '';
  }

  beginEdit(message: ChatMessage): void {
    if (!this.canEdit(message)) {
      return;
    }

    this.editingMessageId = message._id;
    this.editingText = message.content;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editingText = '';
  }

  saveEdit(message: ChatMessage): void {
    const content = this.editingText.trim();
    if (!content || !this.currentUser || !this.selectedConversation || !this.canEdit(message)) {
      return;
    }

    this.chatService.updateMessage(message._id, content, this.currentUser._id, this.selectedConversation._id);
    this.cancelEdit();
  }

  deleteMessage(message: ChatMessage): void {
    if (!this.currentUser || !this.selectedConversation || !this.canEdit(message)) {
      return;
    }

    this.chatService.deleteMessage(message._id, this.currentUser._id, this.selectedConversation._id);
  }

  canEdit(message: ChatMessage): boolean {
    return Boolean(this.currentUser && message.senderId === this.currentUser._id);
  }

  isOwnMessage(message: ChatMessage): boolean {
    return this.canEdit(message);
  }

  getConversationLabel(conversation: ChatConversation): string {
    const otherUserId = this.getOtherParticipantId(conversation);
    const user = this.users.find((candidate) => candidate._id === otherUserId);

    if (user) {
      return this.getUserLabel(user);
    }

    return otherUserId ? `Utilisateur ${otherUserId.slice(-6)}` : 'Conversation';
  }

  getUserLabel(user: ChatUser): string {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return fullName || user.name || user.email || `Utilisateur ${user._id.slice(-6)}`;
  }

  getOtherParticipantId(conversation: ChatConversation): string {
    return conversation.participants.find((participant) => participant !== this.currentUser?._id) ?? '';
  }

  getAvailableUsers(): ChatUser[] {
    if (!this.currentUser) {
      return [];
    }

    return this.users.filter((user) => user._id !== this.currentUser?._id);
  }

  trackByConversationId(_index: number, conversation: ChatConversation): string {
    return conversation._id;
  }

  trackByMessageId(_index: number, message: ChatMessage): string {
    return message._id;
  }

  trackByUserId(_index: number, user: ChatUser): string {
    return user._id;
  }

  private initializeChat(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.loadChatUsers().pipe(
        tap((users) => {
          this.users = users;
          this.currentUser = users[0] ?? null;

          if (this.currentUser) {
            this.setupSocket();
          }
        }),
        switchMap((users) => {
          const currentUser = users[0];
          return currentUser
            ? this.chatService.getConversations(currentUser._id).pipe(catchError(() => of([])))
            : of([]);
        })
      ).subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          this.isLoading = false;

          if (!this.currentUser) {
            this.errorMessage = 'Aucun utilisateur chat trouve dans Mongo.';
          }
        },
        error: () => {
          this.errorMessage = 'Chat indisponible.';
          this.isLoading = false;
        }
      })
    );
  }

  private loadChatUsers() {
    return this.chatService.getActiveUsers().pipe(
      catchError(() => this.chatService.getUsers().pipe(catchError(() => of([]))))
    );
  }

  private loadConversations(): void {
    if (!this.currentUser) {
      return;
    }

    this.isLoading = true;
    this.subscriptions.add(
      this.chatService.getConversations(this.currentUser._id).subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Conversations indisponibles.';
          this.isLoading = false;
        }
      })
    );
  }

  private setupSocket(): void {
    this.socket = this.chatService.connect();
    this.cleanupSocketListeners();

    this.socket.on('messages', (messages: ChatMessage[]) => {
      this.messages = this.chatService.sortMessages(messages);
    });

    this.socket.on('newMessage', (message: ChatMessage) => {
      if (message.conversationId !== this.selectedConversation?._id) {
        this.refreshConversationPreview(message);
        return;
      }

      this.messages = this.chatService.sortMessages([...this.messages, message]);
      this.refreshConversationPreview(message);
    });

    this.socket.on('messageUpdated', (message: ChatMessage) => {
      this.messages = this.messages.map((item) => item._id === message._id ? message : item);
      this.refreshConversationPreview(message);
    });

    this.socket.on('messageDeleted', ({ id }: { id: string }) => {
      this.messages = this.messages.filter((message) => message._id !== id);
    });

    this.socket.on('chat_error', (error: { message?: string } | string) => {
      this.errorMessage = typeof error === 'string' ? error : error.message || 'Erreur chat.';
    });
  }

  private cleanupSocketListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.off('messages');
    this.socket.off('newMessage');
    this.socket.off('messageUpdated');
    this.socket.off('messageDeleted');
    this.socket.off('chat_error');
  }

  private refreshConversationPreview(message: ChatMessage): void {
    this.conversations = this.conversations.map((conversation) => {
      if (conversation._id !== message.conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        lastMessage: message.content,
        updatedAt: message.updatedAt
      };
    });
  }

  private upsertConversation(conversation: ChatConversation): void {
    const exists = this.conversations.some((item) => item._id === conversation._id);
    this.conversations = exists
      ? this.conversations.map((item) => item._id === conversation._id ? conversation : item)
      : [conversation, ...this.conversations];
  }

  private getSenderType(): 'client' | 'freelancer' {
    return this.currentUser?.role?.toLowerCase() === 'client' ? 'client' : 'freelancer';
  }
}
