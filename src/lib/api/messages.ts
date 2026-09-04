import { ApiResponse } from "@/types/auth";
import {
  IncomingMessageRequest,
  SentMessageRequest,
  ConversationSummary,
  ConversationDetail,
  ChatMessage,
  UnreadCounters,
  RelationshipState,
  MessageRequestRecord,
  SenderSummary,
} from "@/types/messaging";
import { getAuthToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * 1. Send a Message Request to target profile/user
 */
export async function sendMessageRequest(target: {
  receiverProfileId?: string;
  receiverUserId?: string;
}): Promise<
  ApiResponse<{
    request: MessageRequestRecord;
    relationshipState: RelationshipState;
    conversationId?: string;
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/message-requests`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(target),
    });

    return await res.json();
  } catch (err) {
    console.error("[SEND MESSAGE REQUEST API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to send request. Please check your network connection.",
    };
  }
}

/**
 * 2. Get incoming message requests
 */
export async function getIncomingRequests(
  page = 1,
  limit = 20
): Promise<
  ApiResponse<{
    requests: IncomingMessageRequest[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/message-requests/incoming?page=${page}&limit=${limit}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[GET INCOMING REQUESTS API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load requests.",
    };
  }
}

/**
 * 3. Get sent message requests
 */
export async function getSentRequests(
  page = 1,
  limit = 20
): Promise<
  ApiResponse<{
    requests: SentMessageRequest[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/message-requests/sent?page=${page}&limit=${limit}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[GET SENT REQUESTS API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load sent requests.",
    };
  }
}

/**
 * 4. Get request detail by ID
 */
export async function getMessageRequest(
  requestId: string
): Promise<
  ApiResponse<{
    request: {
      id: string;
      status: string;
      createdAt: string;
      respondedAt?: string | null;
      isReceiver: boolean;
      sender: SenderSummary;
    };
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/message-requests/${requestId}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch (err) {
    console.error("[GET MESSAGE REQUEST API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load request detail.",
    };
  }
}

/**
 * 5. Accept message request
 */
export async function acceptMessageRequest(
  requestId: string
): Promise<ApiResponse<{ request: MessageRequestRecord; conversationId: string }>> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/message-requests/${requestId}/accept`,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[ACCEPT MESSAGE REQUEST API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to accept request.",
    };
  }
}

/**
 * 6. Decline message request
 */
export async function declineMessageRequest(
  requestId: string
): Promise<ApiResponse<{ request: MessageRequestRecord }>> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/message-requests/${requestId}/decline`,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[DECLINE MESSAGE REQUEST API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to decline request.",
    };
  }
}

/**
 * 7. Get relationship status between authenticated user and target
 */
export async function getRelationshipStatus(
  targetProfileOrUserId: string
): Promise<
  ApiResponse<{
    relationshipState: RelationshipState;
    requestId?: string;
    conversationId?: string;
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: true,
      message: "OK",
      data: { relationshipState: "NO_RELATIONSHIP" },
    };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/message-requests/status/${encodeURIComponent(targetProfileOrUserId)}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    );
    return await res.json();
  } catch {
    return {
      success: true,
      message: "OK",
      data: { relationshipState: "NO_RELATIONSHIP" },
    };
  }
}

/**
 * 8. Get user conversations
 */
export async function getConversations(
  page = 1,
  limit = 20
): Promise<
  ApiResponse<{
    conversations: ConversationSummary[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/messages/conversations?page=${page}&limit=${limit}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[GET CONVERSATIONS API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load conversations.",
    };
  }
}

/**
 * 9. Get conversation detail by ID
 */
export async function getConversation(
  conversationId: string
): Promise<ApiResponse<{ conversation: ConversationDetail }>> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/messages/conversations/${conversationId}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[GET CONVERSATION API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load conversation.",
    };
  }
}

/**
 * 10. Get paginated messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 30,
  beforeCursor?: string
): Promise<
  ApiResponse<{
    messages: ChatMessage[];
    pagination: { total: number; limit: number; hasMore: boolean };
  }>
> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(beforeCursor ? { before: beforeCursor } : {}),
    });

    const res = await fetch(
      `${API_BASE_URL}/api/messages/conversations/${conversationId}/messages?${query.toString()}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[GET MESSAGES API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load messages.",
    };
  }
}

/**
 * 11. Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  body: string
): Promise<ApiResponse<{ message: ChatMessage }>> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "Please log in." };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/messages/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ body }),
      }
    );
    return await res.json();
  } catch (err) {
    console.error("[SEND MESSAGE API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to send message.",
    };
  }
}

/**
 * 12. Mark conversation as read
 */
export async function markConversationRead(
  conversationId: string
): Promise<ApiResponse<void>> {
  const token = getAuthToken();
  if (!token) return { success: false, code: "UNAUTHORIZED", message: "Unauthorized" };

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/messages/conversations/${conversationId}/read`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );
    return await res.json();
  } catch {
    return { success: false, code: "NETWORK_ERROR", message: "Error" };
  }
}

/**
 * 13. Get aggregate unread count for navbar and badges
 */
export async function getUnreadCounters(): Promise<ApiResponse<UnreadCounters>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: true,
      message: "OK",
      data: { unreadRequests: 0, unreadMessages: 0, totalUnread: 0 },
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return {
      success: true,
      message: "OK",
      data: { unreadRequests: 0, unreadMessages: 0, totalUnread: 0 },
    };
  }
}
