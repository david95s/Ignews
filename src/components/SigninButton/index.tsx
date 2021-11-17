import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import styles from './styles.module.scss';

import { signIn, signOut, useSession } from 'next-auth/client';

export const SigninButton = () =>{
  

  const [ session ] = useSession();

  function handleSignIn(){
    signIn('github')
  }

  function handleSignOut(){
    signOut();
  }

  return session ? 
  (
    <button className={styles.signinButton} type="button" onClick={handleSignOut}>
      <FaGithub color="#04d361" />
      David Linconl
      <FiX color="#737380" className={styles.closeIcon}/>
    </button>
  )
  :
  (
    <button className={styles.signinButton} type="button" onClick={handleSignIn}> 
      <FaGithub color="#eba417" />
      Sign in with GitHub
    </button>
  )
}