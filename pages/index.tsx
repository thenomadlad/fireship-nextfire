import { collectionGroup, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from 'firebase/firestore';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useState, MouseEvent } from 'react';
import Loader from '../components/Loader';
import PostFeed from '../components/PostFeed';
import { firestore } from '../lib/firebase';
import { IPost, jsonToPost, postToJson } from '../lib/posts';

const LIMIT = 10;

export default function HomePage({
  posts
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [loadedPosts, setPosts] = useState<IPost[]>(posts.map(jsonToPost));
  const [loading, setLoading] = useState<boolean>(false);
  const [postsEnd, setPostsEnd] = useState<boolean>(false);

  const getMorePosts = async (e: MouseEvent<HTMLButtonElement>) => {
    setLoading(true);

    const last = loadedPosts[loadedPosts.length - 1];
    if (last) {
      const cursor = last.createdAt;

      const q = query(
        collectionGroup(firestore, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(cursor),
        limit(LIMIT)
      )

      console.log(cursor);

      const newPosts: IPost[] = (await getDocs(q)).docs.map((doc) => doc.data() as IPost);
    
      setPosts(loadedPosts.concat(newPosts));
      if (newPosts.length < LIMIT) {
        setPostsEnd(true);
      }
    }
    
    setLoading(false);
  }

  return (
  <main>
    <PostFeed posts={loadedPosts} />

    {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

    <Loader show={loading} />

    {postsEnd && 'You have reached the end!'}
  </main>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const postsQuery = query(
    collectionGroup(firestore, 'posts'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  )

  const posts = (await getDocs(postsQuery)).docs.map(doc => postToJson(doc.data() as IPost));

  return {
    props: { posts }
  }
}