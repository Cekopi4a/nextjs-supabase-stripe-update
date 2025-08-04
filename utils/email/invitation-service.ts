// utils/email/invitation-service.ts
import { Resend } from 'resend';
import { createSupabaseClient } from "@/utils/supabase/server";
import InvitationEmail from '@/components/emails/invitation-email';

export interface InvitationEmailData {
  recipientEmail: string;
  recipientName?: string;
  trainerName: string;
  trainerEmail: string;
  personalMessage?: string;
  invitationToken: string;
  expiresAt: string;
}

export class InvitationEmailService {
  private resend: Resend;
  private supabasePromise: ReturnType<typeof createSupabaseClient>;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not found. Email sending will be disabled.');
      this.resend = null as any;
    } else {
      this.resend = new Resend(apiKey);
    }
    this.supabasePromise = createSupabaseClient();
  }

  /**
   * Send invitation email using Resend
   */
  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      if (!this.resend) {
        console.log('Email service not configured. Logging email details:');
        this.logEmailForDevelopment(data);
        await this.logEmailSent(data, 'dev_logged');
        return true;
      }

      const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/join/${data.invitationToken}`;
      const expiresDate = new Date(data.expiresAt).toLocaleDateString('bg-BG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Send email using React component
      const emailResult = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: data.recipientEmail,
        subject: `🏋️ Покана за тренировки от ${data.trainerName}`,
        react: InvitationEmail({
          recipientName: data.recipientName,
          trainerName: data.trainerName,
          trainerEmail: data.trainerEmail,
          personalMessage: data.personalMessage,
          invitationLink,
          expiresDate,
        }),
      });

      if (emailResult.error) {
        console.error('Resend error:', emailResult.error);
        await this.logEmailSent(data, 'failed', emailResult.error.message);
        return false;
      }

      console.log('Email sent successfully:', emailResult.data?.id);
      await this.logEmailSent(data, 'sent', undefined, emailResult.data?.id);
      return true;

    } catch (error) {
      console.error('Error sending invitation email:', error);
      await this.logEmailSent(data, 'failed', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Send reminder email for pending invitations
   */
  async sendReminderEmail(invitationId: string): Promise<boolean> {
    try {
      const supabase = await this.supabasePromise;
      const { data: invitation } = await supabase
        .from("trainer_invitations")
        .select(`
          *,
          profiles!trainer_invitations_trainer_id_fkey(full_name, email)
        `)
        .eq("id", invitationId)
        .eq("status", "pending")
        .single();

      if (!invitation) {
        throw new Error("Invitation not found or not pending");
      }

      const emailData: InvitationEmailData = {
        recipientEmail: invitation.email,
        recipientName: invitation.first_name,
        trainerName: invitation.profiles?.full_name || 'Треньор',
        trainerEmail: invitation.profiles?.email || '',
        personalMessage: `🔔 Напомняне: ${invitation.personal_message || 'Очакваме ви в нашия екип!'}`,
        invitationToken: invitation.token,
        expiresAt: invitation.expires_at
      };

      return await this.sendInvitationEmail(emailData);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(clientData: {
    email: string;
    full_name: string;
    trainerName: string;
    trainerEmail: string;
  }): Promise<boolean> {
    try {
      if (!this.resend) {
        console.log('Welcome email would be sent to:', clientData.email);
        return true;
      }

      const emailResult = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: clientData.email,
        subject: `🎉 Добре дошли в екипа на ${clientData.trainerName}!`,
        html: this.generateWelcomeEmailHTML(clientData),
      });

      if (emailResult.error) {
        console.error('Welcome email error:', emailResult.error);
        return false;
      }

      console.log('Welcome email sent successfully:', emailResult.data?.id);
      return true;

    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send notification email to trainer when client joins
   */
  async sendTrainerNotificationEmail(trainerData: {
    email: string;
    full_name: string;
    clientName: string;
    clientEmail: string;
  }): Promise<boolean> {
    try {
      if (!this.resend) {
        console.log('Trainer notification would be sent to:', trainerData.email);
        return true;
      }

      const emailResult = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: trainerData.email,
        subject: `🎊 Нов клиент се присъедини към вашия екип!`,
        html: this.generateTrainerNotificationHTML(trainerData),
      });

      if (emailResult.error) {
        console.error('Trainer notification error:', emailResult.error);
        return false;
      }

      console.log('Trainer notification sent successfully:', emailResult.data?.id);
      return true;

    } catch (error) {
      console.error('Error sending trainer notification:', error);
      return false;
    }
  }

  /**
   * Log email for development when Resend is not configured
   */
  private logEmailForDevelopment(data: InvitationEmailData): void {
    const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/join/${data.invitationToken}`;
    
    console.log('\n' + '='.repeat(60));
    console.log('📧 INVITATION EMAIL (Development Mode)');
    console.log('='.repeat(60));
    console.log(`To: ${data.recipientEmail}`);
    console.log(`From: ${data.trainerName} <${data.trainerEmail}>`);
    console.log(`Subject: 🏋️ Покана за тренировки от ${data.trainerName}`);
    console.log('');
    console.log(`Здравейте${data.recipientName ? `, ${data.recipientName}` : ''}!`);
    console.log('');
    console.log(`${data.trainerName} ви кани да станете негов клиент.`);
    if (data.personalMessage) {
      console.log('');
      console.log(`Лично съобщение: "${data.personalMessage}"`);
    }
    console.log('');
    console.log(`🔗 Invitation Link: ${invitationLink}`);
    console.log(`⏰ Expires: ${new Date(data.expiresAt).toLocaleDateString('bg-BG')}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Generate welcome email HTML
   */
  private generateWelcomeEmailHTML(clientData: {
    email: string;
    full_name: string;
    trainerName: string;
    trainerEmail: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Добре дошли!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Добре дошли в екипа!</h1>
        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Вашето фитнес пътуване започва сега</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Здравейте, ${clientData.full_name}!</h2>
        
        <p>Поздравления! Успешно се присъединихте към екипа на <strong>${clientData.trainerName}</strong>.</p>
        
        <div style="background: white; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #4caf50;">Какво следва?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Влезте в акаунта си за да видите персонализираните си програми</li>
            <li>Проверете календара си за предстоящи тренировки</li>
            <li>Свържете се с ${clientData.trainerName} за въпроси</li>
            <li>Започнете да проследявате прогреса си</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/protected" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Влезте в акаунта си
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p><strong>Контакт с треньора:</strong><br>
        ${clientData.trainerName}<br>
        📧 ${clientData.trainerEmail}</p>
        
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          © 2025 Fitness Platform. Всички права запазени.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate trainer notification email HTML
   */
  private generateTrainerNotificationHTML(trainerData: {
    email: string;
    full_name: string;
    clientName: string;
    clientEmail: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Нов клиент се присъедини!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎊 Нов клиент!</h1>
        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Екипът ви се разраства</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Здравейте, ${trainerData.full_name}!</h2>
        
        <p>Имате страхотни новини! <strong>${trainerData.clientName}</strong> прие поканата ви и се присъедини към вашия екип.</p>
        
        <div style="background: white; border: 1px solid #e0e0e0; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #2196f3;">Детайли за клиента:</h3>
          <p><strong>Име:</strong> ${trainerData.clientName}</p>
          <p><strong>Имейл:</strong> ${trainerData.clientEmail}</p>
          <p><strong>Дата на присъединяване:</strong> ${new Date().toLocaleDateString('bg-BG')}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/protected/clients" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Управлявайте клиентите си
          </a>
        </div>
        
        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1565c0;"><strong>Следващи стъпки:</strong></p>
          <p style="margin: 5px 0 0; color: #1565c0;">Създайте персонализирана програма за вашия нов клиент и планирайте първата тренировка.</p>
        </div>
        
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          © 2025 Fitness Platform. Всички права запазени.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Log email sending in database
   */
  private async logEmailSent(
    data: InvitationEmailData, 
    status: string, 
    errorMessage?: string,
    emailId?: string
  ): Promise<void> {
    try {
      const supabase = await this.supabasePromise;
      // Find the invitation ID based on token
      const { data: invitation } = await supabase
        .from("trainer_invitations")
        .select("id")
        .eq("token", data.invitationToken)
        .single();

      if (invitation) {
        // Try to insert email log, but don't fail if table doesn't exist yet
        const { error } = await supabase
          .from("email_logs")
          .insert({
            invitation_id: invitation.id,
            recipient_email: data.recipientEmail,
            email_type: 'invitation',
            subject: `Покана за тренировки от ${data.trainerName}`,
            template_name: 'trainer_invitation',
            status: status,
            external_id: emailId,
            error_message: errorMessage
          });

        if (error) {
          // Log the error but don't throw - email logging is not critical
          console.warn('Failed to log email (this is not critical):', error.message);
        }
      }
    } catch (error) {
      // Don't throw here - email logging failure shouldn't break email sending
      console.warn('Error logging email (this is not critical):', error);
    }
  }
}

// Export singleton instance
export const invitationEmailService = new InvitationEmailService();