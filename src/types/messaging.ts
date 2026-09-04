export type MessageRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type RelationshipState =
  | "NO_RELATIONSHIP"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "ACCEPTED"
  | "DECLINED"
  | "SELF";

export interface MessageRequestRecord {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  status: MessageRequestStatus;
  createdAt: string;
  respondedAt?: string | null;
}

export interface SenderSummary {
  userId: string;
  profileId?: string;
  name: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  location?: string;
  religion?: string;
  community?: string;
  education?: string;
  occupation?: string;
  incomeRange?: string;
  photoUrl?: string | null;
  photos?: { url: string; isPrimary: boolean }[];
}

export interface IncomingMessageRequest {
  id: string;
  createdAt: string;
  status: MessageRequestStatus;
  sender: SenderSummary;
}

export interface SentMessageRequest {
  id: string;
  createdAt: string;
  status: MessageRequestStatus;
  respondedAt?: string | null;
  receiver: {
    userId: string;
    profileId?: string;
    name: string;
    location?: string;
    photoUrl?: string | null;
  };
}

export interface ConversationSummary {
  id: string;
  updatedAt: string;
  partner: {
    userId: string;
    profileId?: string;
    name: string;
    age?: number;
    photoUrl?: string | null;
    isOnline?: boolean;
  };
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    isOwn: boolean;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

export interface ConversationDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  partner: {
    userId: string;
    profileId?: string;
    name: string;
    age?: number;
    gender?: string;
    photoUrl?: string | null;
    isOnline?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  senderUserId: string;
  isOwn: boolean;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

export interface UnreadCounters {
  unreadRequests: number;
  unreadMessages: number;
  totalUnread: number;
}
