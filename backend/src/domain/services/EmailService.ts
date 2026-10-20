export interface Email {
  to: string;
  subject: string;
  text: string;
}

export interface EmailService {
  sendEmail(email: Email): Promise<void>;
}