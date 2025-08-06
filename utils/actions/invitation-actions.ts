// utils/actions/invitation-actions.ts
"use server";

import { createClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/utils/supabase/server';
import { invitationEmailService } from '@/utils/email/invitation-service';

// Server action за приемане на покана
export async function acceptInvitationAction(
  invitationToken: string, 
  clientId: string, 
  clientData: {
    full_name: string;
    email: string;
    phone?: string;
  }
) {
  try {
    console.log('Server action: acceptInvitationAction started', { invitationToken, clientId });

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return { success: false, error: 'Server configuration error' };
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Created service role Supabase client');

    // Get invitation details with trainer info
    const { data: invitation, error: inviteError } = await supabase
      .from("trainer_invitations")
      .select(`
        *,
        profiles!trainer_invitations_trainer_id_fkey(full_name, email)
      `)
      .eq("token", invitationToken)
      .eq("status", "pending")
      .single();

    console.log('Invitation query result:', { invitation, error: inviteError });

    if (inviteError || !invitation) {
      console.error('Invitation not found:', inviteError);
      return { success: false, error: "Invitation not found or already used" };
    }

    // Check if invitation is still valid
    if (new Date(invitation.expires_at) < new Date()) {
      console.error('Invitation expired');
      return { success: false, error: "Invitation has expired" };
    }

    // Check if email matches
    if (invitation.email !== clientData.email) {
      console.error('Email mismatch:', { 
        invitationEmail: invitation.email, 
        clientEmail: clientData.email 
      });
      return { success: false, error: "Email does not match invitation" };
    }

    // Check trainer's client limit
    const { data: subscription } = await supabase
      .from("trainer_subscriptions")
      .select("client_limit")
      .eq("trainer_id", invitation.trainer_id)
      .single();

    const clientLimit = subscription?.client_limit || 3;

    const { count: currentClients } = await supabase
      .from("trainer_clients")
      .select("*", { count: 'exact', head: true })
      .eq("trainer_id", invitation.trainer_id)
      .eq("status", "active");

    if ((currentClients || 0) >= clientLimit) {
      console.error('Client limit reached');
      return { success: false, error: "Trainer has reached their client limit" };
    }

    console.log('All validation passed, creating trainer-client relationship');

    // Create trainer-client relationship
    const { data: relationData, error: relationError } = await supabase
      .from("trainer_clients")
      .insert({
        trainer_id: invitation.trainer_id,
        client_id: clientId,
        invitation_id: invitation.id,
        status: 'active'
      })
      .select()
      .single();

    console.log('Trainer-client relationship result:', { 
      data: relationData, 
      error: relationError 
    });

    if (relationError) {
      console.error("Detailed error creating trainer-client relationship:", {
        error: relationError,
        code: relationError.code,
        message: relationError.message,
        details: relationError.details,
        hint: relationError.hint
      });
      
      return { 
        success: false, 
        error: `Failed to create trainer-client relationship: ${relationError.message}` 
      };
    }

    console.log('Trainer-client relationship created successfully');

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from("trainer_invitations")
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error updating invitation status:", updateError);
      // Don't fail here as the relationship was created successfully
    }

    console.log('Invitation marked as accepted');

    // Send welcome email to client
    try {
      console.log('Sending welcome email to client...');
      await invitationEmailService.sendWelcomeEmail({
        email: clientData.email,
        full_name: clientData.full_name,
        trainerName: invitation.profiles?.[0]?.full_name || 'Треньор',
        trainerEmail: invitation.profiles?.[0]?.email || ''
      });
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the whole process if email fails
    }

    // Send notification to trainer
    try {
      console.log('Sending notification email to trainer...');
      await invitationEmailService.sendTrainerNotificationEmail({
        email: invitation.profiles?.[0]?.email || '',
        full_name: invitation.profiles?.[0]?.full_name || 'Треньор',
        clientName: clientData.full_name,
        clientEmail: clientData.email
      });
      console.log('Trainer notification sent successfully');
    } catch (emailError) {
      console.error("Error sending trainer notification:", emailError);
      // Don't fail the whole process if email fails
    }

    return { success: true };

  } catch (error) {
    console.error('Server action error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Server action за валидиране на покана
export async function validateInvitationAction(token: string) {
  try {
    console.log('Server action: validateInvitationAction started', { token });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { valid: false, error: 'Server configuration error' };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get invitation details with trainer info
    const { data: invitation, error } = await supabase
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
      console.error('Invitation validation error:', error);
      return { valid: false, error: "Invitation not found" };
    }

    // Check if invitation is still valid
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    const isExpired = expiresAt < now;

    if (isExpired && invitation.status === 'pending') {
      // Automatically expire the invitation
      await supabase
        .from("trainer_invitations")
        .update({ status: 'expired' })
        .eq("id", invitation.id);
    }

    // Check if user already exists with this email  
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", invitation.email)
      .single();

    const userExists = !!existingUser;
    const isValid = invitation.status === 'pending' && !isExpired && !userExists;

    const response = {
      valid: isValid,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        first_name: invitation.first_name,
        personal_message: invitation.personal_message,
        trainer_id: invitation.trainer_id,
        trainer_name: invitation.profiles?.[0]?.full_name || 'Unknown',
        trainer_email: invitation.profiles?.[0]?.email || '',
        status: isExpired ? 'expired' : invitation.status,
        expires_at: invitation.expires_at,
        is_expired: isExpired
      },
      userExists,
      error: null as string | null
    };

    // Set appropriate error message
    if (!isValid) {
      if (userExists) {
        response.error = "Потребител с този имейл адрес вече съществува. Моля влезте в акаунта си.";
      } else if (isExpired) {
        response.error = "Поканата е изтекла. Моля свържете се с треньора си за нова покана.";
      } else if (invitation.status === 'accepted') {
        response.error = "Тази покана вече е използвана.";
      } else if (invitation.status === 'cancelled') {
        response.error = "Поканата е отменена.";
      } else {
        response.error = "Поканата е неактивна.";
      }
    }

    console.log('Invitation validation result:', response);
    return response;

  } catch (error) {
    console.error('Validate invitation server action error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

// Server action за изпращане на покана
export async function sendInvitationAction(
  email: string,
  firstName: string,
  personalMessage: string
) {
  try {
    console.log('Server action: sendInvitationAction started', { email, firstName });

    // Валидация на входните параметри
    if (!email?.trim()) {
      return { success: false, error: 'Имейл адресът е задължителен' };
    }

    // Проверка за валиден имейл формат
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, error: 'Моля въведете валиден имейл адрес' };
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'Server configuration error' };
    }

    // Create Supabase client with proper session handling (NOT service role for auth)
    const supabase = await createSupabaseClient();

    // Try to get current user from session
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !currentUser) {
      console.error('Trainer authentication error:', userError);
      return { success: false, error: 'Треньорът не е влязъл в системата' };
    }

    console.log('Current trainer found:', currentUser.id);

    // Get trainer profile
    const { data: trainerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", currentUser.id)
      .single();

    if (profileError || !trainerProfile) {
      console.error('Trainer profile error:', profileError);
      return { success: false, error: 'Треньорски профил не е намерен' };
    }

    // Verify user is a trainer
    if (trainerProfile.role !== 'trainer') {
      return { success: false, error: 'Само треньори могат да изпращат покани' };
    }

    // Допълнителна проверка за имейл на треньора
    if (!trainerProfile.email?.trim() && !currentUser.email?.trim()) {
      console.error('No trainer email available');
      return { success: false, error: 'Няма валиден имейл адрес на треньора. Моля обновете профила си.' };
    }

    console.log('Trainer profile found:', trainerProfile.full_name);

    // Check trainer's client limit
    const { data: subscription } = await supabase
      .from("trainer_subscriptions")
      .select("client_limit")
      .eq("trainer_id", currentUser.id)
      .single();

    const clientLimit = subscription?.client_limit || 3;

    const { count: currentClients } = await supabase
      .from("trainer_clients")
      .select("*", { count: 'exact', head: true })
      .eq("trainer_id", currentUser.id)
      .eq("status", "active");

    if ((currentClients || 0) >= clientLimit) {
      return { success: false, error: `Достигнахте лимита от ${clientLimit} клиента. Надстройте абонамента си.` };
    }

    // Check if email already has pending invitation from this trainer
    const { data: existingInvitation } = await supabase
      .from("trainer_invitations")
      .select("id, status")
      .eq("trainer_id", currentUser.id)
      .eq("email", email.trim())
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return { success: false, error: 'Вече има изпратена покана на този имейл адрес' };
    }

    // Check if a user with this email already exists AND is already a client of this trainer
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim())
      .single();

    if (existingUser) {
      // Check if this user is already a client of this trainer
      const { data: existingClient } = await supabase
        .from("trainer_clients")
        .select("id")
        .eq("trainer_id", currentUser.id)
        .eq("client_id", existingUser.id)
        .eq("status", "active")
        .single();

      if (existingClient) {
        return { success: false, error: 'Този потребител вече е ваш клиент' };
      }

      // User exists but is not our client yet - we can still send invitation
      console.log('User exists but not our client yet - proceeding with invitation');
    } else {
      console.log('User does not exist yet - this is a new registration invitation');
    }

    // NOW create service role client for creating the invitation record
    // (because the invitation table might have RLS that requires service role)
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate unique token
    const token = Math.random().toString(36).substring(2) + 
                 Math.random().toString(36).substring(2) + 
                 Date.now().toString(36);
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation record using service role
    const { data: newInvitation, error: insertError } = await serviceSupabase
      .from("trainer_invitations")
      .insert({
        trainer_id: currentUser.id,
        email: email.trim(),
        first_name: firstName.trim() || null,
        personal_message: personalMessage.trim() || null,
        token: token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invitation:', insertError);
      return { success: false, error: 'Грешка при създаване на поканата' };
    }

    console.log('Invitation created successfully:', newInvitation.id);

    // Send invitation email
    try {
      console.log('Sending invitation email...');
      
      // Ensure we have valid trainer email
      const validTrainerEmail = trainerProfile.email?.trim() || currentUser.email?.trim() || '';
      
      if (!validTrainerEmail) {
        console.error('No valid trainer email found');
        return { 
          success: true, 
          message: 'Поканата е създадена, но имейлът не беше изпратен поради липса на валиден имейл адрес на треньора. Можете да копирате линка ръчно.',
          warning: true
        };
      }

      const emailData = {
        recipientEmail: email.trim(),
        recipientName: firstName.trim() || undefined,
        trainerName: trainerProfile.full_name || 'Треньор',
        trainerEmail: validTrainerEmail,
        personalMessage: personalMessage.trim() || undefined,
        invitationToken: token,
        expiresAt: expiresAt.toISOString()
      };

      console.log('Email data:', {
        recipientEmail: emailData.recipientEmail,
        trainerName: emailData.trainerName,
        trainerEmail: emailData.trainerEmail,
        invitationToken: emailData.invitationToken ? 'present' : 'missing'
      });

      const emailSuccess = await invitationEmailService.sendInvitationEmail(emailData);

      if (emailSuccess) {
        console.log('Invitation email sent successfully');
        return { success: true, message: 'Поканата е изпратена успешно!' };
      } else {
        console.error('Failed to send invitation email');
        return { 
          success: true, 
          message: 'Поканата е създадена, но имейлът не беше изпратен. Можете да копирате линка ръчно.',
          warning: true
        };
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return { 
        success: true, 
        message: 'Поканата е създадена, но имейлът не беше изпратен. Можете да копирате линка ръчно.',
        warning: true
      };
    }

  } catch (error) {
    console.error('Send invitation server action error:', error);
    return { success: false, error: 'Вътрешна грешка на сървъра' };
  }
}

