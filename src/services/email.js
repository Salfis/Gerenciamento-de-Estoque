const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
});

async function enviarEmail(para, assunto, texto) {
    await transporter.sendMail({
        from: 'Sistema de Estoque <nao-responda@estoque.com>',
        to: para,
        subject: assunto,
        text: texto,
    });
}

module.exports = { enviarEmail };