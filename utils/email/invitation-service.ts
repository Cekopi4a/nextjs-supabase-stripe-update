// utils/email/invitation-service.ts
import { createSupabaseClient } from "@/utils/supabase/server";

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
  private supabase: any = null;

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createSupabaseClient();
    }
    return this.supabase;
  }

  /**
   * Send invitation email (integration with email service like Resend, SendGrid, etc.)
   */
  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      // In a real implementation, you would integrate with:
      // - Resend (recommended for simplicity)
      // - SendGrid 
      // - AWS SES
      // - Postmark
      // etc.

      const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/join/${data.invitationToken}`;
      
      const emailHtml = this.generateInvitationEmailHTML(data, invitationLink);
      const emailText = this.generateInvitationEmailText(data, invitationLink);

      // Example with Resend (you need to install @resend/node and configure)
      /*
      import { Resend } from 'resend';
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailResult = await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: data.recipientEmail,
        subject: `Покана за тренировки от ${data.trainerName}`,
        html: emailHtml,
        text: emailText,
      });
      */

      // For now, we'll log the email content and return true
      // In production, replace this with actual email sending
      console.log('=== INVITATION EMAIL ===');
      console.log('To:', data.recipientEmail);
      console.log('Subject:', `Покана за тренировки от ${data.trainerName}`);
      console.log('Link:', invitationLink);
      console.log('========================');

      // Log email in database
      await this.logEmailSent(data);

      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  }

  /**
   * Generate HTML email template
   */
  private generateInvitationEmailHTML(data: InvitationEmailData, invitationLink: string): string {
    const recipientName = data.recipientName || data.recipientEmail.split('@')[0];
    const expiresDate = new Date(data.expiresAt).toLocaleDateString('bg-BG');

    return `
    <!DOCTYPE html>
    <html lang="bg">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Покана за тренировки</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { 
          background: #f8f9fa; 
          padding: 30px; 
          border-radius: 0 0 10px 10px; 
        }
        .message-box { 
          background: #e3f2fd; 
          border-left: 4px solid #2196f3; 
          padding: 15px; 
          margin: 20px 0; 
          border-radius: 4px; 
        }
        .cta-button { 
          display: inline-block; 
          background: #4caf50; 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          font-weight: bold; 
          margin: 20px 0; 
        }
        .footer { 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏋️ Добре дошли в екипа!</h1>
        <p>Поканени сте да започнете фитнес пътуването си</p>
      </div>
      
      <div class="content">
        <h2>Здравейте${recipientName ? `, ${recipientName}` : ''}!</h2>
        
        <p><strong>${data.trainerName}</strong> ви кани да станете негов клиент и да започнете работа заедно за постигане на вашите фитнес цели.</p>
        
        ${data.personalMessage ? `
        <div class="message-box">
          <strong>Лично съобщение от ${data.trainerName}:</strong><br>
          "${data.personalMessage}"
        </div>
        ` : ''}
        
        <h3>Какво ви очаква:</h3>
        <ul>
          <li>🎯 Персонализирани тренировъчни програми</li>
          <li>📅 Календар с планирани тренировки</li>
          <li>📊 Проследяване на прогрес и резултати</li>
          <li>🥗 Хранителни препоръки и планове</li>
          <li>💬 Директна връзка с вашия треньор</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${invitationLink}" class="cta-button">
            Започнете сега
          </a>
        </div>
        
        <p><strong>Важно:</strong> Тази покана е валидна до <strong>${expiresDate}</strong>.</p>
        
        <p>Ако не можете да кликнете на бутона, копирайте и поставете този линк в браузъра си:</p>
        <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">
          ${invitationLink}
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p><strong>Контакт с треньора:</strong><br>
        ${data.trainerName}<br>
        📧 ${data.trainerEmail}</p>
      </div>
      
      <div class="footer">
        <p>Ако не очаквахте този имейл, можете да го игнорирате.</p>
        <p>© 2025 Fitness Platform. Всички права запазени.</p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate plain text email template
   */
  private generateInvitationEmailText(data: InvitationEmailData, invitationLink: string): string {
    const recipientName = data.recipientName || data.recipientEmail.split('@')[0];
    const expiresDate = new Date(data.expiresAt).toLocaleDateString('bg-BG');

    return `
Здравейте${recipientName ? `, ${recipientName}` : ''}!

${data.trainerName} ви кани да станете негов клиент и да започнете работа заедно за постигане на вашите фитнес цели.

${data.personalMessage ? `Лично съобщение от ${data.trainerName}:
"${data.personalMessage}"

` : ''}Какво ви очаква:
• Персонализирани тренировъчни програми
• Календар с планирани тренировки  
• Проследяване на прогрес и резултати
• Хранителни препоръки и планове
• Директна връзка с вашия треньор

За да започнете, кликнете на този линк:
${invitationLink}

Важно: Тази покана е валидна до ${expiresDate}.

Контакт с треньора:
${data.trainerName}
${data.trainerEmail}

Ако не очаквахте този имейл, можете да го игнорирате.

© 2025 Fitness Platform
    `.trim();
  }

  /**
   * Log email sending in database
   */
  private async logEmailSent(data: InvitationEmailData): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      
      // Find the invitation ID based on token
      const { data: invitation } = await supabase
        .from("trainer_invitations")
        .select("id")
        .eq("token", data.invitationToken)
        .single();

      if (invitation) {
        await supabase
          .from("email_logs")
          .insert({
            invitation_id: invitation.id,
            recipient_email: data.recipientEmail,
            email_type: 'invitation',
            subject: `Покана за тренировки от ${data.trainerName}`,
            template_name: 'trainer_invitation',
            status: 'sent'
          });
      }
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  /**
   * Send reminder email for pending invitations
   */
  async sendReminderEmail(invitationId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient();
      
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
        personalMessage: `Това е напомняне за поканата ви. ${invitation.personal_message || ''}`.trim(),
        invitationToken: invitation.token,
        expiresAt: invitation.expires_at
      };

      return await this.sendInvitationEmail(emailData);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const invitationEmailService = new InvitationEmailService();