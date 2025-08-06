// app/api/send-invitation/route.ts - Поправена версия
import { NextRequest, NextResponse } from 'next/server';
import { sendInvitationAction } from '@/utils/actions/invitation-actions';
import { createSupabaseClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, firstName, personalMessage } = await request.json();

    // Validate required fields
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use the server action to send invitation
    const result = await sendInvitationAction(
      email,
      firstName || '',
      personalMessage || ''
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        warning: result.warning || false
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
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

    // Send reminder using invitation email service
    const { invitationEmailService } = await import('@/utils/email/invitation-service');
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