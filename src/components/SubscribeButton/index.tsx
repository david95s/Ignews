import { useSession, signIn } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';




interface SubscribeButtonProps {
  priceId: string;
}


export const SubscribeButton = ({ priceId } : SubscribeButtonProps) =>{

  const router = useRouter();
  const [ session ] = useSession()



  async function handleSubscribe(){
    if(!session){
      signIn('github');
      return
    }

    if(session.activeSubscripton){
      router.push('/posts');
      return;
    }

    try{
      const response = await api.post('/subscribe');
      const { sessionId } = response.data;
      const stripe = await getStripeJs();
      await stripe.redirectToCheckout({sessionId: sessionId})
    }catch(err){
      alert(err.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
    )
}