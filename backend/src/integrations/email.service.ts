export interface EmailMessage {
  to: string[];
  subject: string;
  body: string;
  attachments?: { filename: string; content: Buffer }[];
}

export interface IEmailService {
  sendEmail(tenantId: string, message: EmailMessage): Promise<{ success: boolean; messageId: string }>;
}

export class StubEmailService implements IEmailService {
  async sendEmail(_tenantId: string, message: EmailMessage): Promise<{ success: boolean; messageId: string }> {
    console.log(`[STUB Email] Sending to ${message.to.join(', ')}: ${message.subject}`);
    return { success: true, messageId: `EMAIL-${Date.now()}` };
  }
}
