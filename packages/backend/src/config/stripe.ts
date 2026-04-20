import Stripe from 'stripe';
import { env } from './env';
import logger from '../utils/logger';

if (!env.stripe.secretKey || env.stripe.secretKey === 'placeholder') {
  logger.warn(
    'Stripe secret key is not configured. Payment features will not work.'
  );
}

export const stripe: InstanceType<typeof Stripe> = new Stripe(
  env.stripe.secretKey,
  {
    apiVersion: '2026-03-25.dahlia',
  }
);

export default stripe;
