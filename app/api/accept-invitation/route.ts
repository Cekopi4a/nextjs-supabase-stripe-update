// app/api/accept-invitation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Check if we have the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // This bypasses RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    console.log('Using service role client for invitation acceptance');
    
    const { invitationToken, clientId, clientData } = await request.json();

    if (!invitationToken || !clientId || !clientData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get invitation details with service role permissions
    const { data: invitation, error: inviteError } = await supabase
      .from("trainer_invitations")
      .select("*")
      .eq("token", invitationToken)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already used" },
        { status: 404 }
      );
    }

    // Check if invitation is still valid
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if email matches
    if (invitation.email !== clientData.email) {
      return NextResponse.json(
        { error: "Email does not match invitation" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Trainer has reached their client limit" },
        { status: 400 }
      );
    }

    // Create trainer-client relationship
    console.log('Attempting to create trainer-client relationship:', {
      trainer_id: invitation.trainer_id,
      client_id: clientId,
      invitation_id: invitation.id
    });

    const { error: relationError } = await supabase
      .from("trainer_clients")
      .insert({
        trainer_id: invitation.trainer_id,
        client_id: clientId,
        invitation_id: invitation.id,
        status: 'active'
      });

    if (relationError) {
      console.error("Detailed error creating trainer-client relationship:", {
        error: relationError,
        code: relationError.code,
        message: relationError.message,
        details: relationError.details,
        hint: relationError.hint
      });
      return NextResponse.json(
        { 
          error: "Failed to create trainer-client relationship",
          details: relationError.message 
        },
        { status: 500 }
      );
    }

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

    // Log the successful acceptance
    console.log(`Client accepted invitation: ${clientData.full_name} (${clientData.email}) for trainer ${invitation.trainer_id}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Accept invitation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}