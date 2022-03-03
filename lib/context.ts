import { User } from 'firebase/auth';
import { ContextType, createContext } from 'react';

interface IUserContext {
    user?: User;
    username?: string;
}

export const UserContext = createContext<IUserContext>({
    user: null, username: null
});