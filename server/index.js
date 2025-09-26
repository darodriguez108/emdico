import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) || true,
  methods: ['POST'],
}));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildEmailHtml({ name, empresa, telefono, email, message }) {
  return `
    <h2>Nuevo contacto desde el sitio web</h2>
    <p><strong>Nombre:</strong> ${name || 'Sin nombre'}</p>
    <p><strong>Empresa:</strong> ${empresa || 'Sin empresa'}</p>
    <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
    <p><strong>Correo:</strong> ${email || 'No proporcionado'}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${(message || '').replace(/\n/g, '<br>')}</p>
  `;
}

app.post('/api/contact', async (req, res) => {
  const { name = '', empresa = '', telefono = '', email = '', message = '' } = req.body || {};

  if (!message.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  try {
    const info = await transporter.sendMail({
      from: {
        name: name || 'Contacto EMDICO',
        address: process.env.SMTP_FROM || process.env.SMTP_USER,
      },
      to: process.env.CONTACT_TO,
      subject: `Contacto EMDICO - ${name || 'Sin nombre'}`,
      text: [
        `Nombre: ${name || 'Sin nombre'}`,
        `Empresa: ${empresa || 'Sin empresa'}`,
        `Teléfono: ${telefono || 'No proporcionado'}`,
        `Correo: ${email || 'No proporcionado'}`,
        '',
        'Mensaje:',
        message || '',
      ].join('\n'),
      html: buildEmailHtml({ name, empresa, telefono, email, message }),
      replyTo: email || undefined,
    });

    return res.status(200).json({ success: true, id: info.messageId });
  } catch (err) {
    console.error('Error sending email', err);
    return res.status(500).json({ error: 'No se pudo enviar el correo. Inténtalo más tarde.' });
  }
});

app.use((_, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(port, () => {
  console.log(`Contact server listening on port ${port}`);
});
