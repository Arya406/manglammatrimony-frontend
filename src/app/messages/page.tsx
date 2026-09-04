"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getIncomingRequests,
  getMessageRequest,
  acceptMessageRequest,
  declineMessageRequest,
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/api/messages";
import {
  IncomingMessageRequest,
  ConversationSummary,
  ConversationDetail,
  ChatMessage,
  SenderSummary,
} from "@/types/messaging";
import styles from "./messages.module.css";

interface ActiveRequestState {
  id: string;
  status: string;
  createdAt: string;
  respondedAt?: string | null;
  isReceiver: boolean;
  sender: SenderSummary;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, profileStatus, error, retryValidation } = useAuth();

  // Derive active tab and selected IDs directly from URL query parameters
  const activeTab =
    (searchParams.get("tab") as "requests" | "conversations") || "requests";
  const selectedRequestId = searchParams.get("requestId");
  const selectedConversationId = searchParams.get("conversationId");

  // Data lists
  const [requests, setRequests] = useState<IncomingMessageRequest[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeRequest, setActiveRequest] = useState<ActiveRequestState | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // UI / Loading states
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDecisionBusy, setIsDecisionBusy] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auth guard & profile status verification
  useEffect(() => {
    if (authStatus === "AUTH_LOADING" || authStatus === "AUTH_ERROR") {
      return;
    }

    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
      return;
    }

    if (authStatus === "AUTHENTICATED") {
      if (profileStatus === "IN_REVIEW") {
        router.replace("/onboarding/review");
        return;
      }
      if (profileStatus === "INCOMPLETE") {
        router.replace("/onboarding");
        return;
      }
      if (profileStatus === "REJECTED") {
        router.replace("/onboarding/review");
        return;
      }
      if (profileStatus === "SUSPENDED") {
        router.replace("/onboarding/review");
        return;
      }
    }
  }, [router, authStatus, profileStatus]);

  // Load lists on tab change
  useEffect(() => {
    if (authStatus !== "AUTHENTICATED" || profileStatus !== "ACTIVE") {
      return;
    }

    let isMounted = true;
    const fetchList = async () => {
      try {
        if (activeTab === "requests") {
          const res = await getIncomingRequests();
          if (!isMounted) return;
          if (res.success && res.data) {
            setRequests(res.data.requests);
          } else if (!res.success && res.code === "PROFILE_UNDER_REVIEW") {
            router.replace("/onboarding/review");
          }
        } else {
          const res = await getConversations();
          if (!isMounted) return;
          if (res.success && res.data) {
            setConversations(res.data.conversations);
          } else if (!res.success && res.code === "PROFILE_UNDER_REVIEW") {
            router.replace("/onboarding/review");
          }
        }
      } catch (err) {
        console.error("Failed to load inbox data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingList(false);
        }
      }
    };

    fetchList();
    return () => {
      isMounted = false;
    };
  }, [activeTab, router, authStatus, profileStatus]);

  // Load request detail when selectedRequestId changes
  useEffect(() => {
    let isMounted = true;
    if (selectedRequestId) {
      const loadDetail = async () => {
        try {
          const res = await getMessageRequest(selectedRequestId);
          if (isMounted && res.success && res.data) {
            setActiveRequest(res.data.request);
          }
        } finally {
          if (isMounted) {
            setIsLoadingDetail(false);
          }
        }
      };
      loadDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [selectedRequestId]);

  // Load conversation detail & messages when selectedConversationId changes
  useEffect(() => {
    let isMounted = true;
    if (selectedConversationId) {
      const loadChat = async () => {
        try {
          const [convRes, msgRes] = await Promise.all([
            getConversation(selectedConversationId),
            getMessages(selectedConversationId),
            markConversationRead(selectedConversationId),
          ]);
          if (isMounted) {
            if (convRes.success && convRes.data) {
              setActiveConversation(convRes.data.conversation);
            }
            if (msgRes.success && msgRes.data) {
              setMessages(msgRes.data.messages);
              setTimeout(scrollToBottom, 100);
            }
          }
        } finally {
          if (isMounted) {
            setIsLoadingDetail(false);
          }
        }
      };
      loadChat();
    }
    return () => {
      isMounted = false;
    };
  }, [selectedConversationId]);

  // Periodic lightweight background refresh for new incoming messages/requests (every 12s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedConversationId) {
        getMessages(selectedConversationId).then((res) => {
          if (res.success && res.data) {
            setMessages((prev) => {
              if (res.data!.messages.length > prev.length) {
                setTimeout(scrollToBottom, 100);
                return res.data!.messages;
              }
              return prev;
            });
          }
        });
      } else if (activeTab === "requests") {
        getIncomingRequests().then((res) => {
          if (res.success && res.data) setRequests(res.data.requests);
        });
      } else {
        getConversations().then((res) => {
          if (res.success && res.data) setConversations(res.data.conversations);
        });
      }
    }, 12000);

    return () => clearInterval(timer);
  }, [selectedConversationId, activeTab]);

  // Handle Accept Request
  const handleAccept = async (requestId: string) => {
    if (isDecisionBusy) return;
    setIsDecisionBusy(true);

    try {
      const res = await acceptMessageRequest(requestId);
      if (res.success && res.data) {
        setFeedbackToast("Message request accepted! You can now chat.");
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        const newConvId = res.data.conversationId;
        router.push(`/messages?conversationId=${newConvId}`);
      } else {
        setFeedbackToast(res.message || "Could not accept request.");
      }
    } catch (err) {
      console.error("Accept error:", err);
      setFeedbackToast("Failed to accept request.");
    } finally {
      setIsDecisionBusy(false);
    }
  };

  // Handle Decline Request
  const handleDecline = async (requestId: string) => {
    if (isDecisionBusy) return;
    setIsDecisionBusy(true);

    try {
      const res = await declineMessageRequest(requestId);
      if (res.success) {
        setFeedbackToast("Message request declined.");
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        router.push("/messages?tab=requests");
      } else {
        setFeedbackToast(res.message || "Could not decline request.");
      }
    } catch (err) {
      console.error("Decline error:", err);
      setFeedbackToast("Failed to decline request.");
    } finally {
      setIsDecisionBusy(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draftMessage.trim();
    if (!text || !selectedConversationId || isSendingMessage) return;

    // Optimistic message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderUserId: "me",
      isOwn: true,
      body: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setDraftMessage("");
    setIsSendingMessage(true);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await sendMessage(selectedConversationId, text);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data!.message : m))
        );
      } else {
        setFeedbackToast(res.message || "Failed to deliver message.");
      }
    } catch (err) {
      console.error("Send message error:", err);
      setFeedbackToast("Failed to send message. Please check your network.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Helper for relative timestamps
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffHours < 48) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isMobileDetailActive = Boolean(selectedRequestId || selectedConversationId);

  if (authStatus === "AUTH_LOADING") {
    return (
      <div className={styles.pageWrapper}>
        <AppHeader />
        <main className={styles.mainContent}>
          <div style={{ textAlign: "center", padding: "100px 24px", color: "#8E7479" }}>
            Loading messages & conversations...
          </div>
        </main>
      </div>
    );
  }

  if (authStatus === "AUTH_ERROR") {
    return (
      <div className={styles.pageWrapper}>
        <AppHeader />
        <main className={styles.mainContent}>
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ color: "#7B1123", marginBottom: 16, fontSize: 16 }}>
              {error || "Unable to reach messaging server. Please check your connection."}
            </p>
            <button
              type="button"
              onClick={() => retryValidation()}
              style={{
                padding: "8px 24px",
                backgroundColor: "#7B1123",
                color: "#FFF",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry Connection
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <AppHeader />

      <main className={styles.mainContent}>
        {/* Header Title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>
            Manage your connection requests and active conversations.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackToast && (
          <div className={styles.toastNotice} role="status">
            <span>✓</span>
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Master-Detail Container */}
        <div
          className={[
            styles.inboxContainer,
            isMobileDetailActive ? styles.mobileHideSidebar : styles.mobileHideContent,
          ].join(" ")}
        >
          {/* ==========================================================
              LEFT SIDEBAR: TABS & LIST
              ========================================================== */}
          <aside className={styles.sidebarColumn}>
            {/* Tab Selector */}
            <div className={styles.tabsHeader}>
              <button
                type="button"
                onClick={() => {
                  router.push("/messages?tab=requests");
                }}
                className={[
                  styles.tabButton,
                  activeTab === "requests" ? styles.activeTab : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span>Requests</span>
                {requests.length > 0 && (
                  <span className={styles.tabBadge}>{requests.length}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push("/messages?tab=conversations");
                }}
                className={[
                  styles.tabButton,
                  activeTab === "conversations" ? styles.activeTab : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span>Conversations</span>
                {conversations.some((c) => c.unreadCount > 0) && (
                  <span className={styles.tabBadge}>
                    {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
                  </span>
                )}
              </button>
            </div>

            {/* List Body */}
            <div className={styles.sidebarList}>
              {isLoadingList ? (
                <div className={styles.loadingContainer}>Loading...</div>
              ) : activeTab === "requests" ? (
                requests.length === 0 ? (
                  <div className={styles.emptyPlaceholder}>
                    <p className={styles.placeholderTitle}>No new requests</p>
                    <p className={styles.placeholderText}>
                      When someone wants to connect with you, their request will appear here.
                    </p>
                  </div>
                ) : (
                  requests.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        router.push(`/messages?requestId=${item.id}`);
                      }}
                      className={[
                        styles.listItem,
                        selectedRequestId === item.id ? styles.selectedListItem : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className={styles.avatarWrapper}>
                        {item.sender.photoUrl ? (
                          <Image
                            src={item.sender.photoUrl}
                            alt={item.sender.name}
                            fill
                            className={styles.avatarImage}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {item.sender.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className={styles.itemInfo}>
                        <div className={styles.itemTopRow}>
                          <span className={styles.itemName}>
                            {item.sender.name}
                            {item.sender.age ? `, ${item.sender.age}` : ""}
                          </span>
                          <span className={styles.itemTime}>
                            {formatTime(item.createdAt)}
                          </span>
                        </div>
                        <div className={styles.itemSubRow}>
                          <p className={styles.itemSnippet}>
                            Wants to connect with you
                          </p>
                          <span className={styles.unreadDot} />
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : conversations.length === 0 ? (
                <div className={styles.emptyPlaceholder}>
                  <p className={styles.placeholderTitle}>No conversations yet</p>
                  <p className={styles.placeholderText}>
                    Once you accept a message request, your conversation will appear here.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      router.push(`/messages?conversationId=${conv.id}`);
                    }}
                    className={[
                      styles.listItem,
                      selectedConversationId === conv.id ? styles.selectedListItem : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className={styles.avatarWrapper}>
                      {conv.partner.photoUrl ? (
                        <Image
                          src={conv.partner.photoUrl}
                          alt={conv.partner.name}
                          fill
                          className={styles.avatarImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {conv.partner.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={styles.onlineBadge} />
                    </div>

                    <div className={styles.itemInfo}>
                      <div className={styles.itemTopRow}>
                        <span className={styles.itemName}>
                          {conv.partner.name}
                          {conv.partner.age ? `, ${conv.partner.age}` : ""}
                        </span>
                        <span className={styles.itemTime}>
                          {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
                        </span>
                      </div>
                      <div className={styles.itemSubRow}>
                        <p
                          className={[
                            styles.itemSnippet,
                            conv.unreadCount > 0 ? styles.unreadSnippet : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {conv.lastMessage
                            ? `${conv.lastMessage.isOwn ? "You: " : ""}${conv.lastMessage.body}`
                            : "Start a conversation"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className={styles.unreadDot} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* ==========================================================
              RIGHT COLUMN: DETAIL VIEW (PLACEHOLDER / DECISION / CHAT)
              ========================================================== */}
          <section className={styles.contentColumn}>
            {isLoadingDetail ? (
              <div className={styles.loadingContainer}>Loading details...</div>
            ) : selectedRequestId && activeRequest ? (
              /* Case A: Request Decision Interface */
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.headerLeft}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/messages?tab=requests");
                      }}
                      className={styles.backButton}
                    >
                      ← Back
                    </button>
                    <div>
                      <h2 className={styles.headerPartnerName}>
                        {activeRequest.sender.name}
                        {activeRequest.sender.age ? `, ${activeRequest.sender.age}` : ""}
                      </h2>
                      <p className={styles.headerOnlineText}>
                        <span className={styles.headerOnlineDot} />
                        <span>Online</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.requestDecisionBody}>
                  <div className={styles.decisionCard}>
                    <div className={styles.decisionPhotoWrapper}>
                      {activeRequest.sender.photos?.[0]?.url ? (
                        <Image
                          src={activeRequest.sender.photos[0].url}
                          alt={activeRequest.sender.name}
                          fill
                          className={styles.decisionPhoto}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {activeRequest.sender.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h3 className={styles.decisionName}>
                      {activeRequest.sender.name}, {activeRequest.sender.age}
                    </h3>
                    <p className={styles.decisionMeta}>
                      {activeRequest.sender.gender} • {activeRequest.sender.maritalStatus || "Never Married"}
                    </p>

                    <div className={styles.decisionHighlightBox}>
                      {activeRequest.sender.religion && (
                        <div className={styles.highlightRow}>
                          <span>🕉️</span>
                          <span>
                            {activeRequest.sender.religion}
                            {activeRequest.sender.community ? ` • ${activeRequest.sender.community}` : ""}
                          </span>
                        </div>
                      )}
                      {activeRequest.sender.education && (
                        <div className={styles.highlightRow}>
                          <span>🎓</span>
                          <span>{activeRequest.sender.education}</span>
                        </div>
                      )}
                      {activeRequest.sender.occupation && (
                        <div className={styles.highlightRow}>
                          <span>💼</span>
                          <span>{activeRequest.sender.occupation}</span>
                        </div>
                      )}
                    </div>

                    <p className={styles.decisionQuestion}>
                      &ldquo;{activeRequest.sender.name} wants to connect with you.&rdquo;
                    </p>

                    <div className={styles.decisionActionRow}>
                      <button
                        type="button"
                        onClick={() => handleDecline(selectedRequestId)}
                        disabled={isDecisionBusy}
                        className={styles.declineBtn}
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAccept(selectedRequestId)}
                        disabled={isDecisionBusy}
                        className={styles.acceptBtn}
                      >
                        {isDecisionBusy ? "Connecting..." : "Accept"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : selectedConversationId && activeConversation ? (
              /* Case B: Active Conversation Chat View */
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.headerLeft}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/messages?tab=conversations");
                      }}
                      className={styles.backButton}
                    >
                      ← Back
                    </button>
                    <div className={styles.avatarWrapper} style={{ width: 36, height: 36 }}>
                      {activeConversation.partner.photoUrl ? (
                        <Image
                          src={activeConversation.partner.photoUrl}
                          alt={activeConversation.partner.name}
                          fill
                          className={styles.avatarImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder} style={{ fontSize: 14 }}>
                          {activeConversation.partner.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className={styles.headerPartnerName}>
                        {activeConversation.partner.name}
                        {activeConversation.partner.age ? `, ${activeConversation.partner.age}` : ""}
                      </h2>
                      <p className={styles.headerOnlineText}>
                        <span className={styles.headerOnlineDot} />
                        <span>Online</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className={styles.chatMessagesContainer}>
                  {messages.length === 0 ? (
                    <div className={styles.emptyPlaceholder} style={{ background: "transparent" }}>
                      <p className={styles.placeholderTitle}>Say hello!</p>
                      <p className={styles.placeholderText}>
                        Start your conversation with {activeConversation.partner.name}.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={[
                          styles.messageRow,
                          msg.isOwn ? styles.messageRowOwn : styles.messageRowPartner,
                        ].join(" ")}
                      >
                        <div
                          className={[
                            styles.bubble,
                            msg.isOwn ? styles.bubbleOwn : styles.bubblePartner,
                          ].join(" ")}
                        >
                          <p className={styles.bubbleBody}>{msg.body}</p>
                          <span
                            className={[
                              styles.bubbleTime,
                              msg.isOwn ? styles.bubbleTimeOwn : styles.bubbleTimePartner,
                            ].join(" ")}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <form onSubmit={handleSendMessage} className={styles.composerArea}>
                  <input
                    type="text"
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder="Write a message..."
                    maxLength={2000}
                    disabled={isSendingMessage}
                    className={styles.messageInput}
                  />
                  <button
                    type="submit"
                    disabled={!draftMessage.trim() || isSendingMessage}
                    className={styles.sendButton}
                  >
                    <span>{isSendingMessage ? "Sending..." : "Send"}</span>
                  </button>
                </form>
              </>
            ) : (
              /* Case C: Placeholder when no item is selected */
              <div className={styles.emptyPlaceholder}>
                <div className={styles.placeholderIcon}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className={styles.placeholderTitle}>Your Messages</h3>
                <p className={styles.placeholderText}>
                  Select a message request or active conversation to start communicating.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div style={{ minHeight: "100vh", background: "#FCFAF7" }} />}>
      <MessagesContent />
    </React.Suspense>
  );
}
