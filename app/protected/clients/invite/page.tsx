// app/protected/clients/invite/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send,
  Copy,
  Check,
  Mail,
  Link2,
  Users,
  Clock,
  RefreshCw,
  Trash2,
  Eye,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate unique token
      const token = generateInvitationToken();
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Get trainer profile for email
      const { data: trainerProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const { data: newInvitation, error } = await supabase
        .from("trainer_invitations")
        .insert({
          trainer_id: user.id,
          email: inviteForm.email.trim(),
          first_name: inviteForm.first_name.trim() || null,
          personal_message: inviteForm.personal_message.trim() || null,
          token: token,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      try {
        const response = await fetch('/api/send-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail: inviteForm.email.trim(),
            recipientName: inviteForm.first_name.trim() || null,
            trainerName: trainerProfile?.full_name || 'Треньор',
            trainerEmail: trainerProfile?.email || '',
            personalMessage: inviteForm.personal_message.trim() || null,
            invitationToken: token,
            expiresAt: expiresAt.toISOString()
          })
        });

        if (!response.ok) {
          console.error('Failed to send email, but invitation was created');
          alert("Поканата е създадена, но имейлът не беше изпратен. Можете да копирате линка ръчно.");
        } else {
          alert("Поканата е изпратена успешно!");
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        alert("Поканата е създадена, но имейлът не беше изпратен. Можете да копирате линка ръчно.");
      }

      // Reset form
      setInviteForm({
        email: '',
        first_name: '',
        personal_message: ''
      });

      // Refresh invitations
      fetchInvitations();
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Грешка при изпращане на поканата");
    } finally {
      setSending(false);
    }
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2) + 
           Math.random().toString(36).substring(2) + 
           Date.now().toString(36);
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

  const canSendMoreInvitations = subscription ? 
    subscription.current_clients < subscription.client_limit : false;

  const remainingSlots = subscription ? 
    subscription.client_limit - subscription.current_clients : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Покани клиенти</h1>
            <p className="text-muted-foreground">
              Изпратете покани на нови клиенти за да започнат да работят с вас
            </p>
          </div>
        </div>
        
        <Button variant="outline" asChild>
          <Link href="/protected/subscription">
            Управление на абонамента
          </Link>
        </Button>
      </div>

      {/* Subscription Info */}
      {subscription && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Текущ план: </h3>
                  <Badge variant={subscription.plan_type === 'free' ? 'secondary' : 'default'}>
                    {subscription.plan_type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.current_clients} / {subscription.client_limit} клиента
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {remainingSlots} свободни места
              </span>
              {!canSendMoreInvitations && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
          
          {!canSendMoreInvitations && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800">
                Достигнахте лимита от {subscription.client_limit} клиента. 
                <Link href="/protected/subscription" className="underline ml-1">
                  Надстройте абонамента си
                </Link> за да добавите повече клиенти.
              </p>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Invitation Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Изпрати нова покана</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Имейл адрес *</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                placeholder="client@example.com"
                disabled={!canSendMoreInvitations}
              />
            </div>
            
            <div>
              <Label htmlFor="first_name">Име (опционално)</Label>
              <Input
                id="first_name"
                value={inviteForm.first_name}
                onChange={(e) => setInviteForm({...inviteForm, first_name: e.target.value})}
                placeholder="Георги"
                disabled={!canSendMoreInvitations}
              />
            </div>
            
            <div>
              <Label htmlFor="message">Лично съобщение (опционално)</Label>
              <Textarea
                id="message"
                value={inviteForm.personal_message}
                onChange={(e) => setInviteForm({...inviteForm, personal_message: e.target.value})}
                placeholder="Здравей! Радвам се да работя с теб като твой персонален треньор..."
                rows={4}
                disabled={!canSendMoreInvitations}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Това съобщение ще бъде включено в имейла с поканата
              </p>
            </div>
            
            <Button 
              onClick={sendInvitation} 
              disabled={sending || !canSendMoreInvitations}
              className="w-full"
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Изпратени покани</h2>
            <Button variant="outline" size="sm" onClick={fetchInvitations}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Обнови
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Няма изпратени покани още</p>
              <p className="text-sm">Изпратете първата си покана за да започнете</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
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
      color: isPending ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
      icon: isPending ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />,
      text: isPending ? 'Чакащ' : 'Изтекъл'
    },
    accepted: {
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: 'Приет'
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800',
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
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">{invitation.email}</p>
            <Badge className={`text-xs ${config.color}`}>
              {config.icon}
              <span className="ml-1">{config.text}</span>
            </Badge>
          </div>
          
          {invitation.first_name && (
            <p className="text-sm text-muted-foreground">
              Име: {invitation.first_name}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            Изпратена: {new Date(invitation.created_at).toLocaleDateString('bg-BG')}
          </p>
          
          {isPending && (
            <p className="text-xs text-muted-foreground">
              Изтича след {daysUntilExpiry} дни
            </p>
          )}
          
          {isAccepted && invitation.accepted_at && (
            <p className="text-xs text-green-600">
              Приета: {new Date(invitation.accepted_at).toLocaleDateString('bg-BG')}
            </p>
          )}
        </div>
      </div>
      
      {invitation.personal_message && (
        <div className="text-xs text-muted-foreground mb-2 p-2 bg-gray-50 rounded">
          <p className="italic">"{invitation.personal_message}"</p>
        </div>
      )}
      
      <div className="flex gap-2">
        {(isPending || isExpired) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopyLink(invitation.token)}
            className="flex-1"
          >
            {copiedToken === invitation.token ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Копирано
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Копирай линк
              </>
            )}
          </Button>
        )}
        
        {isExpired && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResend(invitation.id)}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Изпрати отново
          </Button>
        )}
        
        {isPending && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(invitation.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Отмени
          </Button>
        )}
      </div>
    </div>
  );
}