"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { ApiError } from "@/lib/api";
import {
  getMessages,
  listContacts,
  listConversations,
  sendMessage,
  startConversation,
} from "@/lib/api/messaging";
import type {
  ContactDto,
  ConversationDto,
  MessageDto,
} from "@/types/api/messaging";

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export function MessagingView() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.messaging;
  const fallbackError = t.pages.studentContent.error;

  const conversations = useAsync(() => listConversations(), [user?.id]);
  const contacts = useAsync(() => listContacts(), [user?.id]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Keyed on the selected conversation — useAsync owns the fetch/loading/error
  // state, so we avoid hand-rolling a setState-in-effect loader.
  const messagesQuery = useAsync<MessageDto[]>(
    () => (selectedId === null ? Promise.resolve([]) : getMessages(selectedId)),
    [selectedId],
  );
  const messages = messagesQuery.data ?? [];

  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);

  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [contactFilter, setContactFilter] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  const selectedConversation = useMemo(
    () => (conversations.data ?? []).find((c) => c.id === selectedId) ?? null,
    [conversations.data, selectedId],
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (selectedId === null || composer.trim().length === 0 || sending) return;
    setSending(true);
    setActionError(null);
    try {
      await sendMessage(selectedId, composer.trim());
      setComposer("");
      messagesQuery.reload();
      conversations.reload();
    } catch (err) {
      setActionError(errorMessage(err, fallbackError));
    } finally {
      setSending(false);
    }
  }

  async function handlePickContact(contact: ContactDto) {
    setActionError(null);
    try {
      const conversation = await startConversation(contact.id);
      setContactPickerOpen(false);
      setContactFilter("");
      conversations.reload();
      setSelectedId(conversation.id);
    } catch (err) {
      setActionError(errorMessage(err, fallbackError));
    }
  }

  const filteredContacts = useMemo(() => {
    const q = contactFilter.trim().toLowerCase();
    const list = contacts.data ?? [];
    if (!q) return list;
    return list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q),
    );
  }, [contacts.data, contactFilter]);

  return (
    <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-[320px_1fr]">
      {/* Left pane: conversation list + new message */}
      <Card className="flex h-[70vh] flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{tt.conversations}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setContactPickerOpen((v) => !v)}
          >
            {tt.newMessage}
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
          {contactPickerOpen && (
            <div className="rounded-[10px] border border-theme p-3">
              <Input
                placeholder={tt.searchPeople}
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto">
                {contacts.loading ? (
                  <LoadingState />
                ) : contacts.error ? (
                  <ErrorState
                    message={contacts.error.message}
                    onRetry={contacts.reload}
                  />
                ) : filteredContacts.length === 0 ? (
                  <EmptyState
                    title={tt.noContacts}
                    message={tt.noContactsMsg}
                  />
                ) : (
                  <ul className="space-y-1">
                    {filteredContacts.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => handlePickContact(c)}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-theme-muted/10"
                        >
                          <span className="font-medium text-theme">
                            {c.fullName}
                          </span>
                          <span className="text-xs text-theme-muted">
                            {c.role}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversations.loading ? (
              <LoadingState />
            ) : conversations.error ? (
              <ErrorState
                message={conversations.error.message}
                onRetry={conversations.reload}
              />
            ) : (conversations.data ?? []).length === 0 ? (
              <EmptyState
                title={tt.noConversations}
                message={tt.noConversationsMsg}
              />
            ) : (
              <ul className="space-y-1">
                {(conversations.data ?? []).map((c: ConversationDto) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        c.id === selectedId
                          ? "bg-theme-muted/15"
                          : "hover:bg-theme-muted/10"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-theme">
                          {c.otherUserName}
                        </span>
                        <span className="block text-xs text-theme-muted">
                          {c.otherUserRole}
                          {c.lastMessageAt
                            ? ` · ${formatTime(c.lastMessageAt)}`
                            : ""}
                        </span>
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="ml-2 shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right pane: messages + composer */}
      <Card className="flex h-[70vh] flex-col">
        <CardHeader>
          <CardTitle>
            {selectedConversation
              ? selectedConversation.otherUserName
              : tt.selectConversation}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {selectedId === null ? (
              <EmptyState
                title={tt.noConversationSelected}
                message={tt.noConversationSelectedMsg}
              />
            ) : messagesQuery.loading ? (
              <LoadingState />
            ) : messagesQuery.error ? (
              <ErrorState
                message={messagesQuery.error.message}
                onRetry={messagesQuery.reload}
              />
            ) : messages.length === 0 ? (
              <EmptyState
                title={tt.noMessages}
                message={tt.noMessagesMsg}
              />
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.mine
                          ? "bg-indigo-600 text-white"
                          : "bg-theme-muted/15 text-theme"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {m.body}
                      </div>
                      <div
                        className={`mt-1 text-[10px] ${
                          m.mine ? "text-white/70" : "text-theme-muted"
                        }`}
                      >
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {actionError && (
            <p className="mt-2 text-sm text-red-600">{actionError}</p>
          )}

          <form onSubmit={handleSend} className="mt-3 flex items-end gap-2">
            <textarea
              rows={2}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              disabled={selectedId === null}
              placeholder={
                selectedId === null
                  ? tt.typeToStart
                  : tt.typeMessage
              }
              className="flex w-full resize-none rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm shadow-[var(--shadow-xs)] transition-all duration-200 placeholder:text-[var(--foreground-muted)] hover:border-[var(--ring)]/40 focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={
                selectedId === null ||
                composer.trim().length === 0 ||
                sending
              }
            >
              <Send className="h-4 w-4" />
              {sending ? tt.sending : tt.send}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
