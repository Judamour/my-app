import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object as Stripe.Checkout.Session

          // Récupérer la subscription
          const subscription: any = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await prisma.user.update({
            where: { id: session.metadata?.userId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: subscription.items.data[0].price.id,
              subscriptionPlan: session.metadata?.plan as string,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })

          console.log('✅ Subscription created:', session.metadata?.userId)
        }
        break

      case 'invoice.payment_succeeded':
        {
          const invoice: any = event.data.object

          // Stripe peut retourner subscription comme string OU comme objet
          const subscriptionId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription?.id

          // Vérifier que la subscription existe
          if (!subscriptionId) {
            console.log('⚠️ Invoice without subscription:', invoice.id)
            return NextResponse.json({ received: true })
          }

          // Récupérer la subscription
          const subscription: any = await stripe.subscriptions.retrieve(
            subscriptionId
          )

          await prisma.user.update({
            where: { stripeCustomerId: invoice.customer as string },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })

          console.log('✅ Invoice paid:', subscriptionId)
        }
        break

      case 'customer.subscription.updated':
        {
          const subscription: any = event.data.object

          await prisma.user.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })

          console.log('✅ Subscription updated:', subscription.id)
        }
        break

      case 'customer.subscription.deleted':
        {
          const subscription: any = event.data.object

          await prisma.user.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
              subscriptionPlan: 'free',
            },
          })

          console.log('✅ Subscription canceled:', subscription.id)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
