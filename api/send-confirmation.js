/* Built By Nova — Post-payment confirmation email */

const stripe    = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentIntentId, email, name } = req.body || {};

  if (!paymentIntentId || !email) {
    return res.status(400).json({ error: 'paymentIntentId and email are required.' });
  }

  /* Verify payment actually succeeded via Stripe */
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error('[Nova Mail] Could not retrieve payment intent:', err.message);
    return res.status(400).json({ error: 'Invalid payment intent.' });
  }

  if (paymentIntent.status !== 'succeeded') {
    console.warn('[Nova Mail] Payment not succeeded, status:', paymentIntent.status);
    return res.status(400).json({ error: 'Payment has not succeeded.' });
  }

  const firstName = (name || '').split(' ')[0] || 'there';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const downloadLink = process.env.DROPBOX_LINK;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e4;">

          <!-- Header -->
          <tr>
            <td style="background:#323039;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#18C3F8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Built By Nova</p>
              <h1 style="margin:12px 0 0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Your guide is ready 🤍</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;color:#323039;font-size:16px;line-height:1.7;">Hey ${firstName}! 🤍</p>
              <p style="margin:0 0 16px;color:#6B6876;font-size:15px;line-height:1.7;">thank you so much for grabbing my 60-day transformation guide. you just made the best decision for yourself.</p>
              <p style="margin:0 0 16px;color:#6B6876;font-size:15px;line-height:1.7;">inside you'll find everything — the exact workouts, meal plans, daily checklists, and mindset shifts that changed my life. this isn't just a guide, it's a complete system.</p>
              <p style="margin:0 0 32px;color:#6B6876;font-size:15px;line-height:1.7;">you've got this. let's lock in together 💪</p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${downloadLink}" style="display:inline-block;background:#18C3F8;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:100px;letter-spacing:0.2px;">
                      Download Your Guide 💪
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#9B99A5;font-size:13px;line-height:1.6;text-align:center;">
                Or copy this link:<br>
                <a href="${downloadLink}" style="color:#18C3F8;word-break:break-all;">${downloadLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e4e4e4;text-align:center;">
              <p style="margin:0;color:#9B99A5;font-size:13px;line-height:1.6;">— nova</p>
              <p style="margin:8px 0 0;color:#9B99A5;font-size:12px;">Questions? Reply to this email or contact <a href="mailto:novabuiltbusiness@gmail.com" style="color:#18C3F8;">novabuiltbusiness@gmail.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hey ${firstName}! 🤍\n\nthank you so much for grabbing my 60-day transformation guide. you just made the best decision for yourself.\n\ninside you'll find everything — the exact workouts, meal plans, daily checklists, and mindset shifts that changed my life. this isn't just a guide, it's a complete system.\n\nyou've got this. let's lock in together 💪\n\njust click and download. let's lock in 💪\n\n${downloadLink}\n\n— nova`;

  try {
    await transporter.sendMail({
      from:    `"Built By Nova" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'Your 60-Day Transformation Guide is Ready! 🤍',
      text,
      html,
    });
    console.log('[Nova Mail] Sent to:', email);
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('[Nova Mail] Failed to send:', err.message);
    return res.status(200).json({ sent: false, error: err.message });
  }
};
