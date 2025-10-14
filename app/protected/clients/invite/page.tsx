// app/protected/clients/invite/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { sendInvitationAction } from "@/utils/actions/invitation-actions";
import {
  Send,
  Copy,
  Check,
  Mail,
  Users,
  Clock,
  RefreshCw,
  Trash2,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Invitation {
  id: string;
  email: string;
  first_name?: string;
  personal_message?: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

interface TrainerSubscription {
  plan_type: 'free' | 'pro' | 'beast';
  client_limit: number;
  current_clients: number;
}

export default function InviteClientPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [subscription, setSubscription] = useState<TrainerSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    first_name: '',
    personal_message: ''
  });

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchSubscriptionInfo();
    fetchInvitations();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get trainer subscription
      const { data: subData } = await supabase
        .from("trainer_subscriptions")
        .select("plan_type, client_limit")
        .eq("trainer_id", user.id)
        .single();

      // Count current clients
      const { count: currentClients } = await supabase
        .from("trainer_clients")
        .select("*", { count: 'exact', head: true })
        .eq("trainer_id", user.id)
        .eq("status", "active");

      setSubscription({
        plan_type: subData?.plan_type || 'free',
        client_limit: subData?.client_limit || 3,
        current_clients: currentClients || 0
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trainer_invitations")
        .select("*")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteForm.email.trim()) {
      alert("Моля въведете имейл адрес");
      return;
    }

    if (!subscription) {
      alert("Грешка при зареждане на абонамента");
      return;
    }

    if (subscription.current_clients >= subscription.client_limit) {
      alert(`Достигнахте лимита от ${subscription.client_limit} клиента. Надстройте абонамента си.`);
      return;
    }

    // Check if email already has pending invitation
    const existingInvitation = invitations.find(
      inv => inv.email === inviteForm.email && inv.status === 'pending'
    );

    if (existingInvitation) {
      alert("Вече има изпратена покана на този имейл адрес");
      return;
    }

    setSending(true);

    try {
      // Get current user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Моля влезте в акаунта си отново");
        return;
      }

      // Send invitation via API
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: inviteForm.email,
          firstName: inviteForm.first_name,
          personalMessage: inviteForm.personal_message
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.warning) {
          alert(result.message); // Show warning about email not being sent
        } else {
          alert(result.message || "Поканата е изпратена успешно!");
        }

        // Reset form
        setInviteForm({
          email: '',
          first_name: '',
          personal_message: ''
        });

        // Refresh invitations
        fetchInvitations();
      } else {
        alert(result.error || "Грешка при изпращане на поканата");
      }

    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Грешка при изпращане на поканата");
    } finally {
      setSending(false);
    }
  };

  const copyInvitationLink = async (token: string) => {
    const link = `${window.location.origin}/join/${token}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!confirm("Сигурни ли сте, че искате да отмените тази покана?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("trainer_invitations")
        .update({ status: 'cancelled' })
        .eq("id", invitationId);

      if (error) throw error;
      fetchInvitations();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      alert("Грешка при отменяне на поканата");
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      // Extend expiration by 7 days
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { error } = await supabase
        .from("trainer_invitations")
        .update({ 
          expires_at: newExpiresAt.toISOString(),
          status: 'pending'
        })
        .eq("id", invitationId);

      if (error) throw error;
      
      fetchInvitations();
      alert("Поканата е изпратена отново!");
    } catch (error) {
      console.error("Error resending invitation:", error);
      alert("Грешка при повторно изпращане");
    }
  };

  const handleSendInvitation = async () => {
    // Basic validation
    if (!inviteForm.email.trim()) {
      alert("Моля въведете имейл адрес");
      return;
    }
  
    // Check if trainer has reached client limit
    if (!canSendMoreInvitations) {
      alert(`Достигнахте лимита от ${subscription?.client_limit || 3} клиента. Надстройте абонамента си.`);
      return;
    }
  
    // Check if email already has pending invitation
    const existingInvitation = invitations.find(
      inv => inv.email === inviteForm.email && inv.status === 'pending'
    );
  
    if (existingInvitation) {
      alert("Вече има изпратена покана на този имейл адрес");
      return;
    }
  
    setSending(true);
  
    try {
      // Use server action instead of API call
      const result = await sendInvitationAction(
        inviteForm.email,
        inviteForm.first_name,
        inviteForm.personal_message
      );
  
      if (result.success) {
        if (result.warning) {
          alert(result.message); // Show warning about email not being sent
        } else {
          alert(result.message || "Поканата е изпратена успешно!");
        }
  
        // Reset form
        setInviteForm({
          email: '',
          first_name: '',
          personal_message: ''
        });
  
        // Refresh invitations
        fetchInvitations();
      } else {
        alert(result.error || "Грешка при изпращане на поканата");
      }
  
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Грешка при изпращане на поканата");
    } finally {
      setSending(false);
    }
  };

  const canSendMoreInvitations = subscription ? 
    subscription.current_clients < subscription.client_limit : false;

  const remainingSlots = subscription ? 
    subscription.client_limit - subscription.current_clients : 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="space-y-3 sm:flex sm:items-center sm:gap-4 sm:space-y-0">
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link href="/protected/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Link>
          </Button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Покани клиенти</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Изпратете покани на нови клиенти за да започнат да работят с вас
            </p>
          </div>
        </div>

        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/protected/subscription">
            <span className="hidden sm:inline">Управление на абонамента</span>
            <span className="sm:hidden">Абонамент</span>
          </Link>
        </Button>
      </div>

      {/* Subscription Info */}
      {subscription && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base">Текущ план:</h3>
                <Badge variant={subscription.plan_type === 'free' ? 'secondary' : 'default'}>
                  {subscription.plan_type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {subscription.current_clients} / {subscription.client_limit} клиента
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm">
                {remainingSlots} свободни места
              </span>
              {!canSendMoreInvitations && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>

          {!canSendMoreInvitations && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded">
              <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-400">
                Достигнахте лимита от {subscription.client_limit} клиента.
                <Link href="/protected/subscription" className="underline ml-1">
                  Надстройте абонамента си
                </Link> за да добавите повече клиенти.
              </p>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Send Invitation Form */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Изпрати нова покана</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">Имейл адрес *</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                placeholder="client@example.com"
                disabled={!canSendMoreInvitations}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="first_name" className="text-sm">Име (опционално)</Label>
              <Input
                id="first_name"
                value={inviteForm.first_name}
                onChange={(e) => setInviteForm({...inviteForm, first_name: e.target.value})}
                placeholder="Георги"
                disabled={!canSendMoreInvitations}
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm">Лично съобщение (опционално)</Label>
              <Textarea
                id="message"
                value={inviteForm.personal_message}
                onChange={(e) => setInviteForm({...inviteForm, personal_message: e.target.value})}
                placeholder="Здравей! Радвам се да работя с теб като твой персонален треньор..."
                rows={4}
                disabled={!canSendMoreInvitations}
                className="text-sm sm:text-base resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Това съобщение ще бъде включено в имейла с поканата
              </p>
            </div>

            <Button
              onClick={sendInvitation}
              disabled={sending || !canSendMoreInvitations}
              className="w-full text-sm sm:text-base"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Изпращам...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Изпрати покана
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Invitations List */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Изпратени покани</h2>
            <Button variant="outline" size="sm" onClick={fetchInvitations} className="h-8 sm:h-9">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Обнови</span>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Няма изпратени покани още</p>
              <p className="text-xs sm:text-sm mt-1">Изпратете първата си покана за да започнете</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] sm:max-h-96 overflow-y-auto pr-1">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onCopyLink={copyInvitationLink}
                  onCancel={cancelInvitation}
                  onResend={resendInvitation}
                  copiedToken={copiedToken}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InvitationCard({ 
  invitation, 
  onCopyLink, 
  onCancel, 
  onResend, 
  copiedToken 
}: {
  invitation: Invitation;
  onCopyLink: (token: string) => void;
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
  copiedToken: string | null;
}) {
  const expiresAt = new Date(invitation.expires_at);
  const isExpired = expiresAt < new Date();
  const isPending = invitation.status === 'pending' && !isExpired;
  const isAccepted = invitation.status === 'accepted';
  const isCancelled = invitation.status === 'cancelled';
  
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const statusConfig = {
    pending: { 
      color: isPending ? 'bg-blue-100 text-blue-800' : 'bg-muted text-muted-foreground',
      icon: isPending ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />,
      text: isPending ? 'Чакащ' : 'Изтекъл'
    },
    accepted: {
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: 'Приет'
    },
    cancelled: {
      color: 'bg-muted text-muted-foreground',
      icon: <XCircle className="h-3 w-3" />,
      text: 'Отменен'
    },
    expired: {
      color: 'bg-red-100 text-red-800',
      icon: <XCircle className="h-3 w-3" />,
      text: 'Изтекъл'
    }
  };
  
  const currentStatus = isExpired ? 'expired' : invitation.status;
  const config = statusConfig[currentStatus as keyof typeof statusConfig];

  return (
    <div className="border rounded-lg p-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{invitation.email}</p>
            {invitation.first_name && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Име: {invitation.first_name}
              </p>
            )}
          </div>
          <Badge className={`text-xs shrink-0 ${config.color}`}>
            {config.icon}
            <span className="ml-1">{config.text}</span>
          </Badge>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Изпратена: {new Date(invitation.created_at).toLocaleDateString('bg-BG')}</span>

          {isPending && (
            <span className="text-blue-600 dark:text-blue-400">
              Изтича след {daysUntilExpiry} дни
            </span>
          )}

          {isAccepted && invitation.accepted_at && (
            <span className="text-green-600 dark:text-green-400">
              Приета: {new Date(invitation.accepted_at).toLocaleDateString('bg-BG')}
            </span>
          )}
        </div>
      </div>

      {invitation.personal_message && (
        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
          <p className="italic line-clamp-2">"{invitation.personal_message}"</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        {(isPending || isExpired) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopyLink(invitation.token)}
            className="flex-1 h-8 text-xs sm:text-sm"
          >
            {copiedToken === invitation.token ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Копирано
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Копирай линк</span>
                <span className="sm:hidden">Копирай</span>
              </>
            )}
          </Button>
        )}

        {isExpired && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResend(invitation.id)}
            className="flex-1 h-8 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Изпрати отново</span>
            <span className="sm:hidden">Изпрати</span>
          </Button>
        )}

        {isPending && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(invitation.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 text-xs sm:text-sm"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Отмени
          </Button>
        )}
      </div>
    </div>
  );
}