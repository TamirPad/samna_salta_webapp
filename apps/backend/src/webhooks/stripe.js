let Stripe;
try {
  Stripe = require('stripe');
} catch (_) {
  Stripe = null;
}

const logger = require('../utils/logger');

const handleWebhook = async (req, res) => {
  if (!Stripe) {
    return res.status(200).send('Stripe not configured');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    logger.warn('Stripe webhook secret missing; skipping verification');
    return res.status(200).send('No webhook secret');
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
  } catch (err) {
    logger.error('Stripe signature verification failed', { message: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Idempotency: skip if event already processed
    const { getCache, setCache } = require('../config/redis');
    const processedKey = `stripe:event:${event.id}`;
    const processed = await getCache(processedKey);
    if (processed) {
      return res.status(200).send('ok');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'charge.succeeded': {
        const paymentIntent = event.data.object;
        const client = require('../config/database').getClient();
        const db = await client;
        try {
          await db.query('BEGIN');
          const orderId = paymentIntent.metadata && (paymentIntent.metadata.order_id || paymentIntent.metadata.orderId);
          if (orderId) {
            await db.query('UPDATE orders SET payment_status = $1, status = $2, updated_at = NOW() WHERE id = $3', ['paid', 'confirmed', orderId]);
            await db.query(`INSERT INTO order_status_updates (order_id, status, description) VALUES ($1, $2, $3)`, [orderId, 'confirmed', 'Payment confirmed via webhook']);
          }
          await db.query('COMMIT');
        } catch (e) {
          await db.query('ROLLBACK');
          logger.error('Failed to update order from webhook', { message: e.message });
        } finally {
          db.release();
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const client = require('../config/database').getClient();
        const db = await client;
        try {
          await db.query('BEGIN');
          const orderId = paymentIntent.metadata && (paymentIntent.metadata.order_id || paymentIntent.metadata.orderId);
          if (orderId) {
            await db.query('UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2', ['failed', orderId]);
            await db.query(`INSERT INTO order_status_updates (order_id, status, description) VALUES ($1, $2, $3)`, [orderId, 'pending', 'Payment failed']);
          }
          await db.query('COMMIT');
        } catch (e) {
          await db.query('ROLLBACK');
          logger.error('Failed to mark payment failure', { message: e.message });
        } finally {
          db.release();
        }
        break;
      }
      default:
        break;
    }
    // Mark event processed for 24h
    try { await setCache(processedKey, true, 24 * 60 * 60); } catch (_) {}
    res.status(200).send('ok');
  } catch (e) {
    logger.error('Stripe webhook handling error', { message: e.message });
    res.status(500).send('error');
  }
};

module.exports = { handleWebhook };


