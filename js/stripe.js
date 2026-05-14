/* Built By Nova — Stripe Elements (on-site payment) */

(function () {
  'use strict';

  const PK          = 'pk_live_51TVmz3BOPhpUnwYGNdckTxxoR8e8h9SC5fvFl6vg4uW6GtieA8iOL0fbNfQfVG16RIoUA6l4WWns9SlGfaE73FsO00sp8Ityaj';
  const BACKEND_URL = 'https://nova-vbuilttheone-git-main-nova-s-projects6.vercel.app/api/create-payment-intent';

  const form     = document.getElementById('payment-form');
  const cardHost = document.getElementById('card-element');
  if (!form || !cardHost) return;

  /* ── Init ─────────────────────────────────────── */
  const stripe   = Stripe(PK);
  const elements = stripe.elements();

  const card = elements.create('card', {
    hidePostalCode: false,
    style: {
      base: {
        color:           '#1A1A2E',
        fontFamily:      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize:        '15px',
        fontWeight:      '400',
        lineHeight:      '1.5',
        '::placeholder': { color: '#9A9AAE' },
        iconColor:       '#18C3F8',
      },
      invalid: { color: '#dc2626', iconColor: '#dc2626' },
    },
  });

  card.mount('#card-element');

  const wrap = cardHost.closest('.card-host');
  card.on('focus', () => wrap && wrap.classList.add('focused'));
  card.on('blur',  () => wrap && wrap.classList.remove('focused'));

  const errEl = document.getElementById('card-error');
  card.on('change', (e) => {
    e.error ? showErr(errEl, e.error.message) : clearErr(errEl);
  });

  /* Clear field errors as user types */
  ['billing-name', 'billing-email'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearErr(errEl));
  });

  /* ── Submit ───────────────────────────────────── */
  const btn = document.getElementById('pay-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErr(errEl);

    const nameEl  = document.getElementById('billing-name');
    const emailEl = document.getElementById('billing-email');
    const name    = (nameEl  && nameEl.value.trim())  || '';
    const email   = (emailEl && emailEl.value.trim()) || '';

    if (!name) {
      showErr(errEl, 'Please enter your full name.');
      nameEl && nameEl.focus();
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr(errEl, 'Please enter a valid email address.');
      emailEl && emailEl.focus();
      return;
    }

    setLoading(true);

    try {
      console.log('[Nova Pay] Posting to:', BACKEND_URL);
      console.log('[Nova Pay] Payload:', { amount: 1799, currency: 'usd', email, name });

      let res;
      try {
        res = await fetch(BACKEND_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ amount: 1799, currency: 'usd', email, name }),
        });
      } catch (networkErr) {
        console.error('[Nova Pay] Network / CORS error:', networkErr);
        throw new Error('Could not reach the payment server. Check your connection or contact support.');
      }

      console.log('[Nova Pay] Response status:', res.status, res.statusText);

      const raw = await res.text();
      console.log('[Nova Pay] Response body:', raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (_) {
        console.error('[Nova Pay] Non-JSON response:', raw);
        throw new Error(`Server error (${res.status}). Please try again or contact support.`);
      }

      if (!res.ok) {
        console.error('[Nova Pay] Backend error:', data);
        throw new Error(data.error || `Payment server returned ${res.status}. Please try again.`);
      }

      if (!data.clientSecret) {
        console.error('[Nova Pay] Missing clientSecret in response:', data);
        throw new Error('Invalid response from payment server. Please try again.');
      }

      console.log('[Nova Pay] Got clientSecret, confirming card payment...');

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card, billing_details: { name, email } },
      });

      if (error) {
        console.error('[Nova Pay] Stripe confirmCardPayment error:', error);
        const msg = error.code === 'card_declined'
          ? 'Card was declined. Try another card or contact support.'
          : (error.message || 'Something went wrong. Please try again.');
        showErr(errEl, msg);
        setLoading(false);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('[Nova Pay] Payment succeeded:', paymentIntent.id);
        showSuccess(email);
      }
    } catch (err) {
      console.error('[Nova Pay] Caught error:', err);
      showErr(errEl, err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  });

  /* ── Success ──────────────────────────────────── */
  function showSuccess(email) {
    const successEl   = document.getElementById('payment-success');
    const successEmail = document.getElementById('success-email');
    const orDivider   = document.querySelector('.or-divider');
    const paypalWrap  = document.getElementById('paypal-container');
    const paypalErr   = document.getElementById('paypal-error');
    const secureNote  = document.querySelector('.secure-note');
    const priceRow    = document.querySelector('.pay-price-row');
    const cardSub     = document.querySelector('.payment-card__sub');

    form.style.display = 'none';
    if (orDivider)  orDivider.style.display  = 'none';
    if (paypalWrap) paypalWrap.style.display  = 'none';
    if (paypalErr)  paypalErr.style.display   = 'none';
    if (secureNote) secureNote.style.display  = 'none';
    if (priceRow)   priceRow.style.display    = 'none';
    if (cardSub)    cardSub.style.display     = 'none';

    if (successEmail) successEmail.textContent = email;
    if (successEl) {
      successEl.style.display = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ── Helpers ──────────────────────────────────── */
  function setLoading(on) {
    if (!btn) return;
    btn.disabled  = on;
    btn.innerHTML = on
      ? '<span class="btn-spinner"></span>Processing…'
      : 'Complete Purchase';
  }

  function showErr(el, msg) { if (!el) return; el.textContent = msg; el.classList.add('visible'); }
  function clearErr(el)     { if (!el) return; el.textContent = ''; el.classList.remove('visible'); }
})();
