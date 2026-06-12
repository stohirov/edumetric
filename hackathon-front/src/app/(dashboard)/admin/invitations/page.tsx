"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { invitationsApi, groupsApi, ApiError } from "@/lib/api";
import type { InvitationDto, InvitationStatus, Role } from "@/types/api";

const ROLES: Role[] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function statusVariant(
  status: InvitationStatus,
): "default" | "secondary" | "success" | "warning" | "destructive" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "ACCEPTED":
      return "success";
    case "EXPIRED":
      return "secondary";
    case "REVOKED":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function AdminInvitationsPage() {
  const { user } = useAuth();
  const t = useT();

  const invitations = useAsync(
    () => invitationsApi.listInvitations(),
    [user?.id],
  );
  const groups = useAsync(
    () => groupsApi.listGroups({ page: 0, size: 200 }),
    [user?.id],
  );

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [groupId, setGroupId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokingId, setRevokingId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!email.trim()) {
      setCreateError("Email is required.");
      return;
    }
    if (role === "STUDENT" && !groupId) {
      setCreateError("A group is required for students.");
      return;
    }

    setCreating(true);
    setInviteLink(null);
    setCopied(false);
    try {
      const created: InvitationDto = await invitationsApi.createInvitation({
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        role,
        groupId: role === "STUDENT" ? Number(groupId) : undefined,
      });
      if (created.token) {
        setInviteLink(
          `${window.location.origin}/invite?token=${created.token}`,
        );
      }
      setEmail("");
      setFullName("");
      setGroupId("");
      invitations.reload();
    } catch (err) {
      setCreateError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      await invitationsApi.revokeInvitation(id);
      invitations.reload();
    } catch {
      // best-effort; list reload below surfaces server state
    } finally {
      setRevokingId(null);
    }
  };

  const groupItems = groups.data?.items ?? [];

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.invitations}
          description="Invite people to join your institution by email."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Create invitation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="off"
                      placeholder="person@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (createError) setCreateError(null);
                      }}
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name (optional)</Label>
                    <Input
                      id="fullName"
                      autoComplete="off"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={role}
                      onValueChange={(v) => {
                        setRole(v as Role);
                        if (createError) setCreateError(null);
                      }}
                      disabled={creating}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r.charAt(0) + r.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {role === "STUDENT" && (
                    <div className="space-y-2">
                      <Label htmlFor="group">Group</Label>
                      <Select
                        value={groupId}
                        onValueChange={(v) => {
                          setGroupId(v);
                          if (createError) setCreateError(null);
                        }}
                        disabled={creating || groups.loading}
                      >
                        <SelectTrigger id="group">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupItems.map((g) => (
                            <SelectItem key={g.id} value={String(g.id)}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {createError && (
                  <p className="text-sm text-red-600">{createError}</p>
                )}

                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Create invitation
                    </>
                  )}
                </Button>
              </form>

              {inviteLink && (
                <div className="mt-6 rounded-xl border border-indigo-200/70 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <p className="text-sm font-medium text-theme">
                    Invitation link
                  </p>
                  <p className="mt-0.5 text-xs text-theme-muted">
                    This link is shown only once. Copy it now and send it to the
                    invitee.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-lg border border-theme bg-theme-input px-3 py-2 text-xs text-theme">
                      {inviteLink}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {invitations.loading ? (
                <LoadingState />
              ) : invitations.error ? (
                <ErrorState
                  message={invitations.error.message}
                  onRetry={invitations.reload}
                />
              ) : (invitations.data ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-theme-muted">
                  No invitations yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                        <th className="px-3 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Role</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Expires</th>
                        <th className="px-3 py-2 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(invitations.data ?? []).map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-b border-theme/60 last:border-0"
                        >
                          <td className="px-3 py-3 text-theme">{inv.email}</td>
                          <td className="px-3 py-3 text-theme-muted">
                            {inv.role.charAt(0) + inv.role.slice(1).toLowerCase()}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={statusVariant(inv.status)}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-theme-muted">
                            {formatDate(inv.expiresAt)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {inv.status === "PENDING" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={revokingId === inv.id}
                                onClick={() => handleRevoke(inv.id)}
                              >
                                {revokingId === inv.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Revoke"
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
