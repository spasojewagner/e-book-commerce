// src/utils/emailService.ts
import nodemailer from 'nodemailer';
import { escapeHtml } from './helper';

interface PurchasedEbook {
  title: string;
  fileName: string;
  filePath: string; // absolute path from the catalog
  downloadUrl: string; // personal link, valid 24 h, 5 downloads
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'apikey',
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
  }

  /** Sends the bought books as PDF attachments, with a download link for each as a backup. */
  async sendEbooks(email: string, firstName: string, ebooks: PurchasedEbook[]): Promise<void> {
    if (!process.env.EMAIL_PASS) {
      throw new Error('EMAIL_PASS is not set');
    }
    if (!process.env.EMAIL_FROM && !process.env.EMAIL_USER) {
      throw new Error('EMAIL_FROM or EMAIL_USER must be set');
    }

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Vaše kupljene e-knjige - Forbidden Knowledge',
      html: this.generateAttachmentEmailTemplate(firstName, ebooks),
      // Files are read from the server's own folder; nothing is fetched from a URL.
      attachments: ebooks.map((ebook) => ({
        filename: ebook.fileName,
        path: ebook.filePath,
        contentType: 'application/pdf',
      })),
    });
  }

  private generateAttachmentEmailTemplate(firstName: string, ebooks: PurchasedEbook[]): string {
    const ebooksList = ebooks.map(ebook => `
      <div style="margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; color: #7c3aed; font-size: 18px;">${escapeHtml(ebook.title)}</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">📎 Fajl: ${escapeHtml(ebook.fileName)}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px;"><a href="${escapeHtml(ebook.downloadUrl)}" style="color: #7c3aed;">Preuzmi</a> (link važi 24 sata, do 5 preuzimanja)</p>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vaše kupljene e-knjige</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #7c3aed; padding-bottom: 20px;">
            <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">🔮 Forbidden Knowledge</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-style: italic;">Digitalna biblioteka tajnih znanja</p>
          </div>

          <h2 style="color: #333; font-size: 24px;">Zdravo ${escapeHtml(firstName)}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Hvala vam na kupovini! Vaše plaćanje je uspešno potvrđeno i vaše e-knjige su priložene ovom emailu kao PDF fajlovi.
          </p>

          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 20px;">📚 Vaše kupljene e-knjige:</h3>
            ${ebooksList}
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h4 style="color: white; margin: 0 0 15px 0; font-size: 18px;">📎 Kako pristupiti vašim e-knjigama:</h4>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Proverite priloge (attachments) ovog emaila</li>
              <li>Skinite svaki PDF fajl na vaš uređaj</li>
              <li>Otvorite bilo kojim PDF čitačem</li>
              <li>Uživajte u vašem novom znanju! 📖</li>
            </ol>
          </div>

          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">💡 Korisni saveti:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Sačuvajte fajlove na sigurno mesto na vašem uređaju</li>
              <li>Možete ih čitati offline kada god želite</li>
              <li>Podelite između svojih uređaja (telefon, tablet, računar)</li>
              <li>Fajlovi su u PDF formatu - kompatibilni sa svim uređajima</li>
            </ul>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Važno:</strong> Ovi fajlovi su vaša lična kopija. Molimo vas da ih ne delite javno ili komercijalno koristite.
            </p>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Ako imate problema sa pristupom fajlovima ili vam treba dodatna podrška, 
            kontaktirajte nas na <a href="mailto:${process.env.EMAIL_FROM || process.env.EMAIL_USER}" 
            style="color: #7c3aed; text-decoration: none;">${process.env.EMAIL_FROM || process.env.EMAIL_USER}</a>
          </p>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 Forbidden Knowledge. Sva prava zadržana.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              Email poslat: ${new Date().toLocaleString('sr-RS')}
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();