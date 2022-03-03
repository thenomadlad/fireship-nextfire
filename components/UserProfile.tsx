import styles from "../styles/UserProfile.module.css";
import Image from "next/image";

// UI component for user profile
export default function UserProfile({ user }) {
  return (
    <div className={styles["box-center"]}>
      <div className={styles["card-img-center"]}>
        <Image
          src={user.photoURL}
          width="150px"
          height="150px"
          className={styles["card-img-center"]}
          alt="User profile image"
        />
      </div>
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName || "Anonymous User"}</h1>
    </div>
  );
}
