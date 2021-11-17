import React from 'react';
import { GetStaticProps, GetServerSideProps } from 'next';
import  Head  from "next/head";
import Image from 'next/image';
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from '../services/stripe';
import styles from './home.module.scss';

interface  HomeProps {
  product : {
    priceId: string,
    amount: number,
  }
}

/* 
  FORMA DE SE FAZER CHAMADA API NO NEXT.
  1)Cliente-Side             ( ex: fazendo dentro de useEfech() )
  2)Server-Side              ( ex: retornando função getServerSideProps() )
  3)Static Site Generation   ( ex: retornando função getStaticSideProps() )
*/
export default function Home({ product } : HomeProps) {
  //Essa props está vindo de "getServerSideProps() ou do getStaticSideProps()"


  return (
    <>
      <Head>
        <title>Home | ignews</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world</h1>
          <p>
            Get access to all the publications
            <br/>
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>

        <Image 
          src="/images/avatar.svg" 
          alt="Girl coding" 
          width="500"
          height="550" 
          draggable="false"
        />
        
      </main>
    </>
  )
}


/*
  Toda parte de ServerSideRender e StaticSiteGeneration, 
  só pode ser usado apenas dntro das PAGES.
  E nunca dentro de um Component.
  Caso eu queira ter acesso dentro de um Component
  Tenho q passar da page para o component
*/

//Essa funç só pode ter esse nome, e SEMPRE tem q ter o "async"
export const getStaticProps: GetStaticProps = async () => {
//Se eu dê console aq, NÃO aparece no Browser, mas sim no meu teminal
  
  
  //O proprio stripe dentro dele faz um fetch(), pois ele é uma SDK
  const price = await stripe.prices.retrieve('price_1Jow1ODFcWcVHy1PfwILlR3i');

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: "USD"
    }).format(price.unit_amount / 100),
  }
  
  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24, //Time in seconds => 24h
  }
}