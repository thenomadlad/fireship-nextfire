import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { getUserWithUsername } from "../../lib/firebase";
import { IPost, postToJson } from "../../lib/posts";

export default function UserPage({
  user,
  posts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}

export async function getServerSideProps(props: GetServerSidePropsContext) {
  const { username } = props.query;
  const userDoc = await getUserWithUsername("" + username);

  // JSON serializable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();
    const postsQuery = query(
      collection(userDoc.ref, "posts"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    posts = (await getDocs(postsQuery)).docs.map(doc => postToJson(doc.data() as IPost));

    return {
      props: {
        user,
        posts,
      },
    };
  } else {
    return {
      notFound: true
    }
  }
}
