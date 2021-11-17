import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

//Esse cod abaixo o próprio Diego pegou na inernet
async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }
  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([ //Esse Set é tipo um Array,
  'checkout.session.completed',//qndo user realiza uma compra!
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async function handleded(req: NextApiRequest, res: NextApiResponse){

  if(req.method === "POST"){
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"]

    let event: Stripe.Event;

    try{
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.log(error)
      return res.status(400).send(`webhook error: ${error.message}`)
    }

    const type = event.type;

    if(relevantEvents.has(type)){
      try{
        switch(type){
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':

            const subscription = event.data.object as Stripe.Subscription;
            
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            )

            break
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session;
            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )
            break;
          default:
            throw new Error("Unhandled event.")
        }
      }catch(err){
        return res.json({ error: "Webhook handler failed" })
      }

    }

    res.json({ received: "Allright" });
  }else{
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  } 
}