import { auth, firestore } from "./firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserData() {
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState<string>(null);

    useEffect(() => {
        let unsubscribe: () => void;

        if (user) {
            unsubscribe = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
                setUsername(doc.data()?.username);
            });
        } else {
            setUsername(null);
        }

        return unsubscribe;
    }, [user]);

    return { user, username };
}