// app/api/send-invitation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { invitationEmailService, InvitationEmailData } from '@/utils/email/invitation-service';
import { createSupabaseClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a trainer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'trainer') {
      return NextResponse.json(
        { error: 'Only trainers can send invitations' },
        { status: 403 }
      );
    }

    // Parse request body
    const emailData: InvitationEmailData = await request.json();

    // Validate required fields
    if (!emailData.recipientEmail || !emailData.trainerName || !emailData.invitationToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email
    const success = await invitationEmailService.sendInvitationEmail(emailData);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Invitation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle reminder emails
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { invitationId } = await request.json();

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Verify the invitation belongs to the current trainer
    const { data: invitation } = await supabase
      .from('trainer_invitations')
      .select('id')
      .eq('id', invitationId)
      .eq('trainer_id', user.id)
      .single();

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Send reminder
    const success = await invitationEmailService.sendReminderEmail(invitationId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send reminder email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Reminder API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}