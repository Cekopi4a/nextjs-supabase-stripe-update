// app/api/validate-invitation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
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

    // Determine validation status
    const isValid = invitation.status === 'pending' && !isExpired && !userExists;

    const response: {
      valid: boolean,
      invitation: {
        id: string;
        email: string;
        first_name: string | null;
        personal_message: string | null;
        trainer_id: string;
        trainer_name: string;
        trainer_email: string;
        status: string;
        expires_at: string;
        is_expired: boolean;
      },
      userExists: boolean,
      error: string | null
    } = {
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
      error: null
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

    return NextResponse.json(response);

  } catch (error) {
    console.error('Validate invitation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}