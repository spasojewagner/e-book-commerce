// src/utils/emailService.ts
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

interface DownloadLink {
  title: string;
  downloadUrl: string;
}

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
    console.log('📧 Slanje emaila...');
    console.log('📧 Prima:', email);
    console.log('📧 Ime:', firstName);
    console.log('📧 Broj fajlova:', ebooks.length);

    const emailHTML = this.generateAttachmentEmailTemplate(firstName, ebooks);
    
    // Pripremi attachments
    const attachments = [];
    
    for (const ebook of ebooks) {
      // OVDE JE PROBLEM! Popravka putanje
      let fullPath: string;
      
      // Ako putanja počinje sa "public/", ukloni to
      if (ebook.filePath.startsWith('public/')) {
        fullPath = path.resolve(ebook.filePath.replace('public/', ''));
      } else {
        fullPath = path.resolve(ebook.filePath);
      }
      
      console.log('🔍 Tražim fajl:', fullPath);
      console.log('🔍 Originalna putanja:', ebook.filePath);
      
      // Proveri da li fajl postoji
      if (fs.existsSync(fullPath)) {
        console.log('✅ Fajl pronađen:', ebook.fileName);
        
        // Učitaj fajl kao buffer
        const fileContent = fs.readFileSync(fullPath);
        console.log('📄 Veličina fajla:', (fileContent.length / 1024 / 1024).toFixed(2), 'MB');
        
        attachments.push({
          filename: ebook.fileName,
          content: fileContent,
          contentType: 'application/pdf'
        });
      } else {
        console.error(`❌ Fajl ne postoji: ${fullPath}`);
        
        // Pokušaj alternativne putanje
        const altPath = path.resolve('public/uploads/', path.basename(ebook.filePath));
        console.log('🔍 Pokušavam alternativnu putanju:', altPath);
        
        if (fs.existsSync(altPath)) {
          console.log('✅ Fajl pronađen na alternativnoj putanji');
          const fileContent = fs.readFileSync(altPath);
          
          attachments.push({
            filename: ebook.fileName,
            content: fileContent,
            contentType: 'application/pdf'
          });
        } else {
          console.error(`❌ Fajl ne postoji ni na: ${altPath}`);
        }
      }
    }

    if (attachments.length === 0) {
      throw new Error('Nijedan PDF fajl nije pronađen za slanje!');
    }

    console.log(`📎 Pripravljeno ${attachments.length} attachment(a)`);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Vaše kupljene e-knjige - Forbidden Knowledge',
      html: emailHTML,
      attachments: attachments
    };

    try {
      console.log('📤 Šalje se email...');
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email uspešno poslat na: ${email}`);
      console.log('📧 Message ID:', info.messageId);
      console.log(`🎉 ${attachments.length} PDF fajlova poslato!`);
    } catch (error: any) {
      console.error('❌ Greška pri slanju:', error);
      console.error('📧 Proveri config:');
      console.error('- EMAIL_USER:', !!process.env.EMAIL_USER);
      console.error('- EMAIL_PASS:', !!process.env.EMAIL_PASS);
      console.error('- EMAIL_HOST:', process.env.EMAIL_HOST);
      throw new Error(`Greška pri slanju: ${error.message}`);
    }
  }

  private generateAttachmentEmailTemplate(firstName: string, ebooks: EbookAttachment[]): string {
    const ebooksList = ebooks.map(ebook => `
      <div style="margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #7c3aed;">${ebook.title}</h3>
        <p style="color: #666; margin: 0;">📎 Priloženo kao: ${ebook.fileName}</p>
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
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">Forbidden Knowledge</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Digitalna biblioteka</p>
          </div>

          <h2 style="color: #333;">Zdravo ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hvala na kupovini! Vaše plaćanje je potvrđeno i vaše e-knjige su priložene ovom emailu kao PDF fajlovi.
          </p>

          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 20px;">Vaše e-knjige (priložene):</h3>
            ${ebooksList}
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h4 style="color: #333; margin: 0 0 10px 0;">📎 Informacije o prilozima:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Svi fajlovi su u PDF formatu</li>
              <li>Sačuvajte priložene fajlove na vaš uređaj</li>
              <li>Možete ih čitati offline kad god želite</li>
              <li>Podelite sa vašim uređajima po potrebi</li>
            </ul>
          </div>

          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">💡 Kako pristupiti fajlovima:</h4>
            <ol style="color: #666; margin: 0; padding-left: 20px;">
              <li>Proverite priloge ovog emaila</li>
              <li>Skinite svaki PDF fajl na vaš uređaj</li>
              <li>Otvorite bilo kojim PDF čitačem (Adobe, Chrome, itd.)</li>
              <li>Uživajte u vašem zabranjenom znanju! 📚</li>
            </ol>
          </div>

          <p style="color: #666; line-height: 1.6;">
            Ako imate problema sa pristupom fajlovima ili vam treba podrška, kontaktirajte nas na 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #7c3aed;">${process.env.EMAIL_USER}</a>
          </p>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              © 2025 Forbidden Knowledge. Sva prava zadržana.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();