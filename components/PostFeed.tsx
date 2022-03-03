import Link from "next/link";
import { IPost } from "../lib/posts";

function PostItem({ post, admin }: { post: IPost; admin: boolean }) {
  // Naive method to calc word count and read time
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);

  return (
    <div className="card">
      <a>
        <Link href={`/${post.username}`} passHref>
          <strong>By @{post.username}</strong>
        </Link>
      </a>

      <h2>
        <Link href={`/${post.username}/${post.slug}`} passHref>
          <a>{post.title}</a>
        </Link>
      </h2>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>
        <span className="push-left">💗 {post.heartCount || 0} Hearts</span>
      </footer>

      {/* If admin view, show extra controls for user */}
      {admin && (
        <>
          <h3>
            <Link href={`/admin/${post.slug}`} passHref>
              <button className="btn-blue">Edit</button>
            </Link>
          </h3>

          {post.published ? (
            <p className="text-success">Live</p>
          ) : (
            <p className="text-danger">Unpublished</p>
          )}
        </>
      )}
    </div>
  );
}

export default function PostFeed({
  posts,
  admin = false,
}: {
  posts: IPost[];
  admin?: boolean;
}) {
  return posts ? (
    <>
      {posts.map((post) => (
        <PostItem post={post} key={post.slug} admin={admin} />
      ))}
    </>
  ) : null;
}
