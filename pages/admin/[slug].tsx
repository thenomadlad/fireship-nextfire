import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import AuthCheck from "../../components/AuthCheck";
import ImageUploader from "../../components/ImageUploader";
import { UserContext } from "../../lib/context";
import { firestore } from "../../lib/firebase";
import styles from "../../styles/Admin.module.css";

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });
  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            maxLength: { value: 20000, message: "content is too long" },
            minLength: { value: 10, message: "content is too short" },
            required: { value: true, message: "content is required" },
          })}
        ></textarea>

        {errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register("published")}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          disabled={!isDirty || !isValid}
          className="btn-green"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

function PostManager() {
  const [preview, setPreview] = useState<boolean>(false);

  const router = useRouter();
  const { user } = useContext(UserContext);
  const { slug } = router.query;

  const postRef = doc(firestore, "users", user.uid, "posts", "" + slug);
  const [post] = useDocumentData(postRef);

  if (!post) {
    return null;
  }

  return (
    <>
      <section>
        <h1>{post.title}</h1>
        <p>ID: {post.slug}</p>

        <PostForm postRef={postRef} defaultValues={post} preview={preview} />
      </section>

      <aside>
        <h3>Tools</h3>
        <button onClick={() => setPreview(!preview)}>
          {preview ? "Edit" : "Preview"}
        </button>
        <Link href={`/${post.username}/${post.slug}`} passHref>
          <button className="btn-blue">Live view</button>
        </Link>
      </aside>
    </>
  );
}

export default function AdminPostEditPage() {
  return (
    <main className={styles.container}>
      <AuthCheck>
        <PostManager />
      </AuthCheck>
    </main>
  );
}
