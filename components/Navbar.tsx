import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../lib/context";
import { auth } from "../lib/firebase";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const { user, username } = useContext(UserContext);

  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <Link href="/" passHref>
            <button className="btn-logo">FEED</button>
          </Link>
        </li>

        {/* user is signed-in and has username */}
        {username && user && (
          <ul>
            <li className="push-left">
              <button onClick={() => auth.signOut()}>Sign Out</button>
            </li>
            <li className="push-left">
              <Link href="/admin" passHref>
                <button className="btn-blue">Write posts</button>
              </Link>
            </li>
            <li>
              <Link href={`/${username}`} passHref>
                <a>
                <Image src={user?.photoURL} height="50px" width="50px" alt="User profile image" />
                </a>
              </Link>
            </li>
          </ul>
        )}

        {/* user is not signed in OR has not created a username */}
        {!(username && user) && (
          <li>
            <Link href="/enter" passHref>
              <button className="btn-blue">Log in</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
