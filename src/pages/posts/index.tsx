import Head from 'next/head';
import styles from './styles.module.scss';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Link, { LinkProps } from 'next/link';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updateAt: string; 
};

interface PostsProps{
  posts:Post[]
};


export default function Posts({ posts }: PostsProps) {

  return (
    <>
      <Head>
        <title>
          Posts | Ignews
        </title>
      </Head>
      
      <main className={styles.containerPosts}>
        <div className={styles.wrapperPosts}>
          {
            posts.map((post, index) => {
              return (
                <Link href={`/posts/preview/${post.slug}`} key={post.slug}>
                  <a>
                    <time>{post.updateAt}</time>
                    <strong>{post.title}</strong>
                    <p>{post.excerpt}</p>
                  </a>
                </Link>
              )
            })
          }
        </div>
      </main>
    </>
  )
}



export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  //Prismic tmbm tem sua propria QUERY language
  const response = await prismic.query( 
    [
      Prismic.predicates.at('document.type', 'publication'),
    ],{
      fetch: ['publication.title', 'publication.content'],
      pageSize: 100,
    }
  ) //Aq estou pegando o titulo/conteudo de todos os meus posts/publication lá do Prismic

  const posts = response.results.map( post =>{ 
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find( content => content.type === 'paragraph')?.text ?? '',
      updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  });

  return {
    props:{
      posts
    },
    revalidate: 60 * 60 * 24, //Time in seconds => 24h
  }
}