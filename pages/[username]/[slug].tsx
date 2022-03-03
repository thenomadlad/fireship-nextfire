import { collectionGroup, doc, getDoc, getDocs } from "firebase/firestore";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { firestore, getUserWithUsername } from "../../lib/firebase";
import { IPost, IPostJson, postToJson } from "../../lib/posts";
import ReactMarkdown from "react-markdown";
import { useDocumentData } from "react-firebase-hooks/firestore";
import styles from "../../styles/Post.module.css";
import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/HeartButton";

function PostContent({ post }) {
  const createdAt = new Date(post.createdAt);

  return (
    <div className="card">
      <h1>{post.title}</h1>
      <span className="text-sm">
        Written by{" "}
        <Link href={`/${post.username}/`} passHref>
          <a className="text-info">@{post.username}</a>
        </Link>{" "}
        on {createdAt.toISOString()}
      </span>
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </div>
  );
}

export default function PostPage({
  post,
  path,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const postRef = doc(firestore, path);
  const [realtimePost] = useDocumentData(postRef);

  let renderedPost: IPostJson;
  if (realtimePost) {
    renderedPost = postToJson(realtimePost as IPost);
  } else {
    renderedPost = post;
  }

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={renderedPost} />
      </section>

      <aside className="card">
        <p>
          <strong>{renderedPost.heartCount || 0} 🤍</strong>
        </p>
        <AuthCheck fallback={
          <Link href="/enter" passHref>
            <button>💗 Sign Up</button>
          </Link>
        }>
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername("" + username);

  let post: IPostJson;
  let path: string;

  if (userDoc) {
    const postRef = doc(userDoc.ref, "posts", "" + slug);

    path = postRef.path;
    const rawPost = (await getDoc(postRef)).data() as IPost;

    if (rawPost) {
      post = postToJson(rawPost);
    } else {
      return {
        notFound: true,
      };
    }
  } else {
    return {
      notFound: true,
    };
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  const snapshot = await getDocs(collectionGroup(firestore, "posts"));

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
}
