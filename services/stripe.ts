// lib/services/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// ============================================================================
// SUBSCRIPTION MANAGEMENT (for Landlords)
// ============================================================================

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    name: "Basic",
    price: 29,
    propertyLimit: 5,
    features: [
      "Up to 5 properties",
      "Unlimited tenants",
      "Online rent collection",
      "Maintenance tracking",
      "Basic reporting",
    ],
  },
  PROFESSIONAL: {
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    name: "Professional",
    price: 49,
    propertyLimit: 10,
    features: [
      "Up to 10 properties",
      "Everything in Basic",
      "Automated rent reminders",
      "Advanced reporting",
      "Document storage",
      "Priority support",
    ],
  },
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    name: "Premium",
    price: 79,
    propertyLimit: 20,
    features: [
      "Up to 20 properties",
      "Everything in Professional",
      "Multi-property analytics",
      "Custom lease templates",
      "API access",
      "Dedicated support",
    ],
  },
} as const;

/**
 * Create a Stripe customer for a landlord
 */
export async function createStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
      },
    });

    return { success: true, customer };
  } catch (error) {
    console.error("Create Stripe customer error:", error);
    return { success: false, error: "Failed to create customer" };
  }
}

/**
 * Create a subscription with 14-day trial
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 14
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    return { success: true as const, subscription };
  } catch (error) {
    console.error("Create subscription error:", error);
    return { success: false as const, error: "Failed to create subscription" };
  }
}

/**
 * Create a setup intent for adding payment method during trial
 */
export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return { success: true, setupIntent };
  } catch (error) {
    console.error("Create setup intent error:", error);
    return { success: false, error: "Failed to create setup intent" };
  }
}

/**
 * Update subscription tier
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0]?.id,
            price: newPriceId,
          },
        ],
        proration_behavior: "create_prorations",
      }
    );

    return { success: true as const, subscription: updatedSubscription };
  } catch (error) {
    console.error("Update subscription error:", error);
    return { success: false as const, error: "Failed to update subscription" };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
      ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
    });

    return { success: true as const, subscription };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return { success: false as const, error: "Failed to cancel subscription" };
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return { success: true as const, subscription };
  } catch (error) {
    console.error("Reactivate subscription error:", error);
    return { success: false as const, error: "Failed to reactivate subscription" };
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "latest_invoice"],
    });

    return { success: true as const, subscription };
  } catch (error) {
    console.error("Get subscription error:", error);
    return { success: false as const, error: "Failed to get subscription" };
  }
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Create billing portal session error:", error);
    return { success: false, error: "Failed to create portal session" };
  }
}

// ============================================================================
// PAYMENT PROCESSING (for Tenant Rent Payments)
// ============================================================================

/**
 * Create payment intent for rent payment
 */
export async function createPaymentIntent(
  amount: number, // in dollars
  currency: string = "usd",
  metadata?: Record<string, string>,
  customerId?: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      ...(customerId && { customer: customerId }),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { success: true as const, paymentIntent };
  } catch (error) {
    console.error("Create payment intent error:", error);
    return { success: false as const, error: "Failed to create payment intent" };
  }
}

/**
 * Confirm payment intent
 */
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return { success: true, paymentIntent };
  } catch (error) {
    console.error("Confirm payment intent error:", error);
    return { success: false, error: "Failed to confirm payment" };
  }
}

/**
 * Create ACH payment intent
 */
export async function createACHPaymentIntent(
  amount: number,
  customerId: string,
  metadata?: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customerId,
      payment_method_types: ["us_bank_account"],
      metadata,
    });

    return { success: true, paymentIntent };
  } catch (error) {
    console.error("Create ACH payment intent error:", error);
    return { success: false, error: "Failed to create ACH payment" };
  }
}

/**
 * Attach payment method to customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
) {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return { success: true, paymentMethod };
  } catch (error) {
    console.error("Attach payment method error:", error);
    return { success: false, error: "Failed to attach payment method" };
  }
}

/**
 * List customer payment methods
 */
export async function listPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return { success: true, paymentMethods: paymentMethods.data };
  } catch (error) {
    console.error("List payment methods error:", error);
    return { success: false, error: "Failed to list payment methods" };
  }
}

/**
 * Detach payment method
 */
export async function detachPaymentMethod(paymentMethodId: string) {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return { success: true, paymentMethod };
  } catch (error) {
    console.error("Detach payment method error:", error);
    return { success: false, error: "Failed to detach payment method" };
  }
}

/**
 * Create refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount in dollars
  reason?: "duplicate" | "fraudulent" | "requested_by_customer"
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) }),
      ...(reason && { reason }),
    });

    return { success: true as const, refund };
  } catch (error) {
    console.error("Create refund error:", error);
    return { success: false as const, error: "Failed to create refund" };
  }
}

/**
 * Retrieve payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, paymentIntent };
  } catch (error) {
    console.error("Retrieve payment intent error:", error);
    return { success: false, error: "Failed to retrieve payment intent" };
  }
}

// ============================================================================
// WEBHOOK HELPERS
// ============================================================================

/**
 * Construct webhook event from raw body
 */
export async function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    return { success: true, event };
  } catch (error) {
    console.error("Construct webhook event error:", error);
    return { success: false, error: "Invalid webhook signature" };
  }
}

// ============================================================================
// CHECKOUT SESSION (Alternative to Payment Intents)
// ============================================================================

/**
 * Create checkout session for one-time payment
 */
export async function createCheckoutSession(
  amount: number,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
  customerId?: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Rent Payment",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      ...(customerId && { customer: customerId }),
    });

    return { success: true, session };
  } catch (error) {
    console.error("Create checkout session error:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

/**
 * Create subscription checkout session
 */
export async function createSubscriptionCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  customerId?: string,
  trialDays: number = 14
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerId && { customer: customerId }),
      subscription_data: {
        trial_period_days: trialDays,
      },
    });

    return { success: true, session };
  } catch (error) {
    console.error("Create subscription checkout session error:", error);
    return {
      success: false,
      error: "Failed to create subscription checkout session",
    };
  }
}