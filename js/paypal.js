/* ══════════════════════════════════════════════════
   Built By Nova — PayPal Buttons
   ══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const container = document.getElementById('paypal-container');
  if (!container) return;

  let attempts = 0;
  function init() {
    if (typeof paypal === 'undefined') {
      if (++attempts < 40) setTimeout(init, 250);
      return;
    }

    paypal.Buttons({
      style: {
        layout:  'horizontal',
        color:   'gold',
        shape:   'rect',
        label:   'pay',
        height:  44,
        tagline: false,
      },

      createOrder(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount:      { value: '1.00', currency_code: 'USD' },
            description: 'Built By Nova — 60-Day Transformation Program',
          }],
          application_context: { shipping_preference: 'NO_SHIPPING' },
        });
      },

      onApprove(data, actions) {
        return actions.order.capture().then((order) => {
          window.location.href = 'thank-you.html?ref=' + order.id;
        });
      },

      onError(err) {
        console.error('[PayPal]', err);
        const el = document.getElementById('paypal-error');
        if (el) {
          el.textContent = 'PayPal encountered an issue. Please use the card form above.';
          el.classList.add('visible');
        }
      },
    }).render('#paypal-container');
  }

  init();
})();
