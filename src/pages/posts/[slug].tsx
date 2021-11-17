import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { getPrismicClient } from '../../services/prismic';

import { RichText } from 'prismic-dom';

import styles from './slugpost.module.scss';

type PostProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updateAt: string; 
  }
};


export default function Post({ post }: PostProps){

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.containerPost}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updateAt}</time>
          {/* p ele =>{post.content}<= funcionar preciso de dangerouslySetInnerHTML */}
          
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>
      </main>
    </>
  )
}



/*
  Como só quem tem o plano vai poder acessar essa page
  Não pode ser GetStaticProps, e sim GetServerSideProps
*/
export const getServerSideProps: GetServerSideProps = async ({ req, params }) =>{

  const session = await  getSession({ req });
  // console.log(session)

  if(!session?.activeSubscripton){
    //Dentro de getServerSideProps, p/ redirecionar, é só retornar um Redirect
    return {
      redirect:{
        destination: '/',//redirecionando para a index da aplication
        permanent: false,
      }
    }
  }


  const { slug } = params;

  const prismic = getPrismicClient(req)

  const response = await prismic.getByUID('publication', String(slug), {});

  const post = { 
      slug: slug,
      title: RichText.asText(response.data.title),
      content: RichText.asHtml(response.data.content),
      updateAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }

  return {
    props:{
      post
    }
  }
}