// src/utils/emailService.ts
import nodemailer from 'nodemailer';

interface EbookAttachment {
  title: string;
  filePath: string;
  fileName: string;
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
      tls: {
        rejectUnauthorized: false
      }
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email greška:', error);
      } else {
        console.log('✅ Email server spreman');
      }
    });
  }

  async sendEbookAttachments(
    email: string,
    firstName: string,
    ebooks: EbookAttachment[]
  ): Promise<void> {
    console.log('\n📧 === POČETAK SLANJA EMAILA ===');
    console.log('📧 Prima:', email);
    console.log('📧 Ime:', firstName);
    console.log('📧 Broj fajlova:', ebooks.length);
    
    // Validate email configuration first
    if (!process.env.EMAIL_PASS) {
      throw new Error('EMAIL_PASS environment variable is not set');
    }

    if (!process.env.EMAIL_FROM && !process.env.EMAIL_USER) {
      throw new Error('EMAIL_FROM or EMAIL_USER must be set');
    }

    console.log('✅ Email konfiguracija validna');

    const emailHTML = this.generateAttachmentEmailTemplate(firstName, ebooks);
    const attachments = [];
    
    // NOVO: Koristi URL linkove umesto lokalnih fajlova (kao u YouTube tutorialu)
    for (let i = 0; i < ebooks.length; i++) {
      const ebook = ebooks[i];
      console.log(`\n📚 Priprema attachment ${i + 1}/${ebooks.length}: ${ebook.title}`);
      
      // Generiši URL za fajl
      let fileUrl;
      
      // Ako filePath već počinje sa http, koristi ga direktno
      if (ebook.filePath.startsWith('http')) {
        fileUrl = ebook.filePath;
      } else {
        // Inače, napravi URL na osnovu backend servera
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        fileUrl = `${baseUrl}/uploads/${ebook.fileName}`;
      }
      
      console.log('📎 URL za attachment:', fileUrl);
      
      // Dodaj attachment sa URL-om
      attachments.push({
        filename: ebook.fileName,
        path: fileUrl, // Ovo je ključno - path umesto content
        contentType: 'application/pdf',
        disposition: 'attachment'
      });

      console.log(`✅ Attachment pripremljen: ${ebook.fileName}`);
    }

    if (attachments.length === 0) {
      const errorMsg = 'Nijedan PDF fajl nije pripremljen za slanje!';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`\n📎 Pripremljeno ${attachments.length} attachment(a) preko URL-ova`);

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Vaše kupljene e-knjige - Forbidden Knowledge',
      html: emailHTML,
      attachments: attachments
    };

    try {
      console.log('\n📤 Slanje emaila u toku...');
      console.log('📧 Od:', mailOptions.from);
      console.log('📧 Za:', mailOptions.to);
      console.log('📧 Attachments:', attachments.length);
      console.log('📧 URLs:', attachments.map(a => a.path));
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('\n✅ === EMAIL USPEŠNO POSLAT ===');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Prima:', email);
      console.log('📚 Poslato fajlova:', attachments.length);
      console.log('📧 Response:', info.response);
      
    } catch (error: any) {
      console.error('\n❌ === GREŠKA PRI SLANJU EMAILA ===');
      console.error('📧 Error code:', error.code);
      console.error('📧 Error message:', error.message);
      console.error('📧 Error response:', error.response);
      
      // Debug email configuration
      console.error('\n🔧 Debug email konfiguracije:');
      console.error('- EMAIL_HOST:', process.env.EMAIL_HOST);
      console.error('- EMAIL_PORT:', process.env.EMAIL_PORT);
      console.error('- EMAIL_USER exists:', !!process.env.EMAIL_USER);
      console.error('- EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
      console.error('- EMAIL_FROM:', process.env.EMAIL_FROM);
      
      throw new Error(`Greška pri slanju emaila: ${error.message}`);
    }
  }

  // TEST METODA - dodaj ovo za testiranje
  async sendTestEmail(email: string, testFileUrl: string): Promise<void> {
    console.log('\n🧪 === TEST EMAIL ===');
    console.log('📧 Test email za:', email);
    console.log('📎 Test file URL:', testFileUrl);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'TEST - PDF Attachment',
      html: `
        <h2>Test Email</h2>
        <p>Ovo je test email sa PDF attachment-om preko URL-a.</p>
        <p>URL: ${testFileUrl}</p>
      `,
      attachments: [{
        filename: 'test-document.pdf',
        path: testFileUrl,
        contentType: 'application/pdf'
      }]
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('✅ Test email poslat, Message ID:', info.messageId);
  }

  private generateAttachmentEmailTemplate(firstName: string, ebooks: EbookAttachment[]): string {
    const ebooksList = ebooks.map(ebook => `
      <div style="margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; color: #7c3aed; font-size: 18px;">${ebook.title}</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">📎 Fajl: ${ebook.fileName}</p>
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

          <h2 style="color: #333; font-size: 24px;">Zdravo ${firstName}! 👋</h2>
          
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