import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const subject = 'Verify your email';
    const text = `Please verify your email by visiting: ${verifyUrl}`;
    const html = `<p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p>`;

    if (!this.transporter) {
      // Fallback: log to console
      console.log('Verification email (no SMTP configured):', {
        to,
        subject,
        text,
      });
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to,
      subject,
      text,
      html,
    });
  }
}
