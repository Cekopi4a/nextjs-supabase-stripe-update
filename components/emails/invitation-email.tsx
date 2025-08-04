// components/emails/invitation-email.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  interface InvitationEmailProps {
    recipientName?: string;
    trainerName: string;
    trainerEmail: string;
    personalMessage?: string;
    invitationLink: string;
    expiresDate: string;
  }
  
  export const InvitationEmail = ({
    recipientName,
    trainerName = 'Вашия треньор',
    trainerEmail,
    personalMessage,
    invitationLink,
    expiresDate,
  }: InvitationEmailProps) => {
    const previewText = `${trainerName} ви кани да започнете фитнес пътуването си заедно!`;
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header */}
            <Section style={header}>
              <Heading style={headerTitle}>🏋️‍♀️ Добре дошли в екипа!</Heading>
              <Text style={headerSubtitle}>
                Поканени сте да започнете фитнес пътуването си
              </Text>
            </Section>
  
            {/* Main Content */}
            <Section style={content}>
              <Heading style={h1}>
                Здравейте{recipientName ? `, ${recipientName}` : ''}!
              </Heading>
              
              <Text style={text}>
                <strong>{trainerName}</strong> ви кани да станете негов клиент и да 
                започнете работа заедно за постигане на вашите фитнес цели.
              </Text>
  
              {/* Personal Message */}
              {personalMessage && (
                <Section style={messageBox}>
                  <Text style={messageTitle}>
                    💬 Лично съобщение от {trainerName}:
                  </Text>
                  <Text style={messageText}>"{personalMessage}"</Text>
                </Section>
              )}
  
              {/* Features */}
              <Section style={featuresSection}>
                <Heading style={h2}>Какво ви очаква:</Heading>
                <ul style={featuresList}>
                  <li style={featureItem}>
                    🎯 <strong>Персонализирани тренировъчни програми</strong>
                    <br />
                    <span style={featureDescription}>
                      Тренировки адаптирани към вашите цели и възможности
                    </span>
                  </li>
                  <li style={featureItem}>
                    📅 <strong>Календар с планирани тренировки</strong>
                    <br />
                    <span style={featureDescription}>
                      Организирайте тренировките си и следете прогреса
                    </span>
                  </li>
                  <li style={featureItem}>
                    📊 <strong>Проследяване на прогрес и резултати</strong>
                    <br />
                    <span style={featureDescription}>
                      Виждайте напредъка си в реално време с графики и статистики
                    </span>
                  </li>
                  <li style={featureItem}>
                    🥗 <strong>Хранителни препоръки и планове</strong>
                    <br />
                    <span style={featureDescription}>
                      Персонализирани хранителни планове за по-бързи резултати
                    </span>
                  </li>
                  <li style={featureItem}>
                    💬 <strong>Директна връзка с вашия треньор</strong>
                    <br />
                    <span style={featureDescription}>
                      Комуникирайте лесно и получавайте подкрепа когато ви трябва
                    </span>
                  </li>
                </ul>
              </Section>
  
              {/* CTA Button */}
              <Section style={buttonSection}>
                <Button style={button} href={invitationLink}>
                  🚀 Започнете сега
                </Button>
              </Section>
  
              {/* Expiry Notice */}
              <Section style={warningBox}>
                <Text style={warningText}>
                  ⏰ <strong>Важно:</strong> Тази покана е валидна до{' '}
                  <strong>{expiresDate}</strong>.
                </Text>
              </Section>
  
              {/* Manual Link */}
              <Section>
                <Text style={smallText}>
                  Ако не можете да кликнете на бутона, копирайте и поставете този линк в браузъра си:
                </Text>
                <Link href={invitationLink} style={linkText}>
                  {invitationLink}
                </Link>
              </Section>
  
              <Hr style={hr} />
  
              {/* Trainer Contact */}
              <Section>
                <Text style={contactTitle}>📧 Контакт с треньора:</Text>
                <Text style={contactInfo}>
                  <strong>{trainerName}</strong>
                  <br />
                  {trainerEmail}
                </Text>
              </Section>
            </Section>
  
            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                Ако не очаквахте този имейл, можете спокойно да го игнорирате.
              </Text>
              <Text style={footerText}>
                © 2025 Fitness Platform. Всички права запазени.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  // Styles
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
  };
  
  const header = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 30px',
    textAlign: 'center' as const,
    borderRadius: '12px 12px 0 0',
  };
  
  const headerTitle = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px',
  };
  
  const headerSubtitle = {
    color: '#e6f3ff',
    fontSize: '16px',
    margin: '0',
  };
  
  const content = {
    padding: '40px 30px',
  };
  
  const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 20px',
  };
  
  const h2 = {
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '30px 0 15px',
  };
  
  const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 20px',
  };
  
  const messageBox = {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
    padding: '20px',
    margin: '25px 0',
    borderRadius: '4px',
  };
  
  const messageTitle = {
    color: '#1976d2',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 8px',
  };
  
  const messageText = {
    color: '#1565c0',
    fontSize: '16px',
    fontStyle: 'italic',
    margin: '0',
    lineHeight: '24px',
  };
  
  const featuresSection = {
    margin: '30px 0',
  };
  
  const featuresList = {
    margin: '0',
    padding: '0',
    listStyle: 'none',
  };
  
  const featureItem = {
    margin: '0 0 20px',
    fontSize: '16px',
    lineHeight: '24px',
    color: '#333',
  };
  
  const featureDescription = {
    color: '#666',
    fontSize: '14px',
    fontWeight: 'normal',
  };
  
  const buttonSection = {
    textAlign: 'center' as const,
    margin: '40px 0',
  };
  
  const button = {
    backgroundColor: '#4caf50',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 32px',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
  };
  
  const warningBox = {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '6px',
    padding: '16px',
    margin: '25px 0',
  };
  
  const warningText = {
    color: '#856404',
    fontSize: '14px',
    margin: '0',
    textAlign: 'center' as const,
  };
  
  const smallText = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '20px 0 8px',
  };
  
  const linkText = {
    color: '#2196f3',
    fontSize: '14px',
    wordBreak: 'break-all' as const,
    display: 'block',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    textDecoration: 'none',
  };
  
  const hr = {
    borderColor: '#e6ebf1',
    margin: '30px 0',
  };
  
  const contactTitle = {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 8px',
  };
  
  const contactInfo = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 20px',
  };
  
  const footer = {
    padding: '30px',
    textAlign: 'center' as const,
    borderTop: '1px solid #e6ebf1',
  };
  
  const footerText = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '0 0 8px',
  };
  
  export default InvitationEmail;