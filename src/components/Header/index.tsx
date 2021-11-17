import Image from 'next/image';
import { SigninButton } from '../SigninButton';
import styles from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';

export const Header = () => {

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image 
          src="/images/logo.svg" 
          alt="Ignews website logo" 
          width="100"
          height="40"
        />
        <nav>
          <ActiveLink activeClassName={styles.active}  href="/">
            <a>Home</a>
          </ActiveLink>

          <ActiveLink activeClassName={styles.active} href="/posts">
            <a >Posts</a>
          </ActiveLink>
        </nav>

        <SigninButton/>
      </div>
    </header>
  )
}