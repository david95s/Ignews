import React from 'react';
import Head from 'next/head';
import {  GetStaticProps } from 'next';
import { getPrismicClient } from '../../../services/prismic';
import Link from 'next/link';

import { RichText } from 'prismic-dom';

import styles from '../slugpost.module.scss';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';

type PostPreviewProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updateAt: string; 
  }
};


export default function PostPreview({ post }: PostPreviewProps){

  const [ session ] = useSession();

  const router = useRouter();

  React.useEffect(()=>{
    if(session?.activeSubscripton){
      router.push(`/posts/${post.slug}`)
    }
  },[session])

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}


export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

/*
  Como o preview pode ser publica então ela pode ser Estática!
  => getStaticProps <=
*/
export const getStaticProps: GetStaticProps = async ({ params }) =>{
  const { slug } = params;

  const prismic = getPrismicClient()

  const response = await prismic.getByUID('publication', String(slug), {});


  const post = { 
      slug: slug,
      title: RichText.asText(response?.data.title),
      content: RichText.asHtml(response.data.content.splice(0, 2)),
      updateAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }

  return {
    props:{
      post,
    },
    revalidate: 60 * 30, //Time in seconds => 30 minutes
  }
}