// utils/invitation/acceptance-handler.ts
import { createSupabaseClient } from "@/utils/supabase/client";

export interface AcceptInvitationParams {
  invitationToken: string;
  clientId: string;
  clientData: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

export class InvitationAcceptanceHandler {
  private supabase = createSupabaseClient();

  /**
   * Accept invitation and create trainer-client relationship
   */
  async acceptInvitation(params: AcceptInvitationParams): Promise<{ success: boolean; error?: string }> {
    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await this.supabase
        .from("trainer_invitations")
        .select("*")
        .eq("token", params.invitationToken)
        .eq("status", "pending")
        .single();

      if (inviteError || !invitation) {
        return { success: false, error: "Invitation not found or already used" };
      }

      // Check if invitation is still valid
      if (new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: "Invitation has expired" };
      }

      // Check if email matches
      if (invitation.email !== params.clientData.email) {
        return { success: false, error: "Email does not match invitation" };
      }

      // Check trainer's client limit
      const canAddClient = await this.checkTrainerClientLimit(invitation.trainer_id);
      if (!canAddClient) {
        return { success: false, error: "Trainer has reached their client limit" };
      }

      // Create trainer-client relationship
      const { error: relationError } = await this.supabase
        .from("trainer_clients")
        .insert({
          trainer_id: invitation.trainer_id,
          client_id: params.clientId,
          invitation_id: invitation.id,
          status: 'active'
        });

      if (relationError) {
        console.error("Error creating trainer-client relationship:", relationError);
        return { success: false, error: "Failed to create trainer-client relationship" };
      }

      // Mark invitation as accepted
      const { error: updateError } = await this.supabase
        .from("trainer_invitations")
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        // Don't return error here as the relationship was created successfully
      }

      // Send welcome notification to trainer
      await this.notifyTrainerOfAcceptance(invitation.trainer_id, params.clientData);

      return { success: true };

    } catch (error) {
      console.error("Error accepting invitation:", error);
      return { success: false, error: "Internal error occurred" };
    }
  }

  /**
   * Check if trainer can add more clients
   */
  private async checkTrainerClientLimit(trainerId: string): Promise<boolean> {
    try {
      // Get trainer's subscription
      const { data: subscription } = await this.supabase
        .from("trainer_subscriptions")
        .select("client_limit")
        .eq("trainer_id", trainerId)
        .single();

      const clientLimit = subscription?.client_limit || 3; // Default free tier limit

      // Count current active clients
      const { count: currentClients } = await this.supabase
        .from("trainer_clients")
        .select("*", { count: 'exact', head: true })
        .eq("trainer_id", trainerId)
        .eq("status", "active");

      return (currentClients || 0) < clientLimit;

    } catch (error) {
      console.error("Error checking client limit:", error);
      return false;
    }
  }

  /**
   * Notify trainer when a client accepts their invitation
   */
  private async notifyTrainerOfAcceptance(trainerId: string, clientData: { full_name: string; email: string }): Promise<void> {
    try {
      // In a real app, you would:
      // 1. Send an email notification to the trainer
      // 2. Create a notification record in the database
      // 3. Send a push notification if supported

      console.log(`New client accepted invitation: ${clientData.full_name} (${clientData.email}) for trainer ${trainerId}`);

      // Example: Create notification record
      /*
      await this.supabase
        .from("notifications")
        .insert({
          user_id: trainerId,
          type: 'client_joined',
          title: 'Нов клиент се присъедини',
          message: `${clientData.full_name} прие поканата ви и се присъедини към екипа!`,
          data: {
            client_name: clientData.full_name,
            client_email: clientData.email
          }
        });
      */

    } catch (error) {
      console.error("Error notifying trainer:", error);
    }
  }

  /**
   * Get invitation details by token (for validation)
   */
  async getInvitationByToken(token: string) {
    try {
      const { data: invitation, error } = await this.supabase
        .from("trainer_invitations")
        .select(`
          id,
          email,
          first_name,
          personal_message,
          trainer_id,
          status,
          expires_at,
          profiles!trainer_invitations_trainer_id_fkey(
            full_name,
            email
          )
        `)
        .eq("token", token)
        .single();

      if (error || !invitation) {
        return null;
      }

      // Check if invitation is still valid
      const expiresAt = new Date(invitation.expires_at);
      const now = new Date();

      if (expiresAt < now && invitation.status === 'pending') {
        // Automatically expire the invitation
        await this.supabase
          .from("trainer_invitations")
          .update({ status: 'expired' })
          .eq("id", invitation.id);
        
        return null;
      }

      return {
        id: invitation.id,
        email: invitation.email,
        first_name: invitation.first_name,
        personal_message: invitation.personal_message,
        trainer_id: invitation.trainer_id,
        trainer_name: invitation.profiles?.[0]?.full_name || 'Unknown',
        trainer_email: invitation.profiles?.[0]?.email || '',
        status: invitation.status,
        expires_at: invitation.expires_at,
        is_expired: expiresAt < now,
        is_valid: invitation.status === 'pending' && expiresAt >= now
      };

    } catch (error) {
      console.error("Error getting invitation:", error);
      return null;
    }
  }

  /**
   * Check if user already exists with the invitation email
   */
  async checkExistingUser(email: string): Promise<boolean> {
    try {
      const { data: existingUser } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      return !!existingUser;
    } catch (error) {
      return false;
    }
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extend expiration by 7 days
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { error } = await this.supabase
        .from("trainer_invitations")
        .update({ 
          expires_at: newExpiresAt.toISOString(),
          status: 'pending'
        })
        .eq("id", invitationId);

      if (error) {
        return { success: false, error: "Failed to update invitation" };
      }

      // Send reminder email via API
      try {
        const response = await fetch('/api/send-invitation', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invitationId })
        });

        if (!response.ok) {
          console.error('Failed to send reminder email');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }

      return { success: true };

    } catch (error) {
      console.error("Error resending invitation:", error);
      return { success: false, error: "Internal error occurred" };
    }
  }
}

// Export singleton instance
export const invitationAcceptanceHandler = new InvitationAcceptanceHandler();