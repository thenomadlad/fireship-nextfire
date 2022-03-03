import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserContext } from "../lib/context";
import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import { debounce } from "lodash";
import Image from "next/image";

/* --- Helpers --- */
const validateUsernameRE =
  /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

function validateUsername(value: string) {
  return value.length > 3 && validateUsernameRE.test(value);
}

const checkUsernameDoesntExist = debounce(
  async (
    username: string,
    setIsUniqueCallback: (isUnique: boolean) => void,
    setLoadingCallback: (isLoading: boolean) => void
  ) => {
    if (username.length >= 3) {
      const ref = doc(firestore, "usernames", username);
      const resolved = await getDoc(ref);
      console.log("Firestore read executed!");

      setIsUniqueCallback(!resolved.exists());
      setLoadingCallback(false);
    }
  },
  500
);

/* --- Components --- */

function SignInButton() {
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleAuthProvider);
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <Image width="30px" height="30px" src="/google.png" alt="Google logo" /> &nbsp; Sign in with Google
    </button>
  );
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameMessage({
  username,
  isValid,
  isUnique,
  loading,
}: {
  username: string;
  isValid: boolean;
  isUnique: boolean;
  loading: boolean;
}) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid && isUnique) {
    return <p className="text-success">{username} is available!</p>;
  } else if (isValid && !isUnique) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

function UsernameForm() {
  const { user, username } = useContext(UserContext);

  const [formValue, setFormValue] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isUnique, setIsUnique] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userDoc = doc(firestore, "users", user.uid);
    const usernameDoc = doc(firestore, "usernames", formValue);

    const batch = writeBatch(firestore);
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();

    setLoading(false);
    setIsValid(false);
    setIsUnique(false);

    if (validateUsername(val)) {
      setIsValid(true);
      setFormValue(val);
      setLoading(true);
    }
  };

  useEffect(() => {
    checkUsernameDoesntExist(formValue, setIsUnique, setLoading);
  }, [formValue]);

  return (
    !username && (
      <section>
        <h3>Choose username</h3>
        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="username"
            autoComplete="off"
            onChange={onChange}
          />

          <UsernameMessage
            username={formValue}
            isValid={isValid}
            isUnique={isUnique}
            loading={loading}
          />

          <button
            type="submit"
            className="btn-green"
            disabled={!(isValid && isUnique)}
          >
            Choose
          </button>

          <h3>Debug state:</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Valid: {isValid.toString()}
            <br />
            Unique: {isUnique.toString()}
          </div>
        </form>
      </section>
    )
  );
}

export default function EnterPage({
  pageComponentProps,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useContext(UserContext);

  return (
    <main>
      {user ? (
        <>
          <UsernameForm />
          <SignOutButton />
        </>
      ) : (
        <SignInButton />
      )}
    </main>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      pageComponentProps: {},
    },
  };
}
