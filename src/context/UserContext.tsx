import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '../types';

const STORAGE_KEY = 'wtt_current_user';
const KNOWN_USERS_KEY = 'wtt_known_users';

interface UserContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addKnownUser: (user: User) => void;
  findKnownUserByNameAndEmail: (name: string, email: string) => { id: string } | null;
  isCreator: (job: { createdBy?: string }) => boolean;
  canEditJob: (job: { createdBy?: string }) => boolean;
  canDeleteJob: (job: { createdBy?: string }) => boolean;
  canManageOffers: (job: { createdBy?: string }) => boolean;
  canCreateOffer: () => boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function loadKnownUsers(): User[] {
  try {
    const raw = localStorage.getItem(KNOWN_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function saveKnownUsers(users: User[]) {
  localStorage.setItem(KNOWN_USERS_KEY, JSON.stringify(users));
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setState] = useState<User | null>(loadStoredUser);

  const setCurrentUser = useCallback((user: User | null) => {
    setState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const addKnownUser = useCallback((user: User) => {
    const users = loadKnownUsers();
    const byId = users.find((u) => u.id === user.id);
    const byEmail = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (byId) {
      saveKnownUsers(users.map((u) => (u.id === user.id ? user : u)));
    } else if (byEmail) {
      saveKnownUsers(users.map((u) => (u.email.toLowerCase() === user.email.toLowerCase() ? user : u)));
    } else {
      saveKnownUsers([...users, user]);
    }
  }, []);

  const findKnownUserByNameAndEmail = useCallback((name: string, email: string) => {
    const users = loadKnownUsers();
    const n = name.trim().toLowerCase();
    const e = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === e && u.name.toLowerCase() === n);
    return found ? { id: found.id } : null;
  }, []);

  const isCreator = useCallback(
    (job: { createdBy?: string }) =>
      !!currentUser && job.createdBy === currentUser.id,
    [currentUser]
  );

  const canEditJob = useCallback(
    (job: { createdBy?: string }) => isCreator(job),
    [isCreator]
  );

  const canDeleteJob = useCallback(
    (job: { createdBy?: string }) => isCreator(job),
    [isCreator]
  );

  const canManageOffers = useCallback(
    (job: { createdBy?: string }) => isCreator(job),
    [isCreator]
  );

  const canCreateOffer = useCallback(
    () => currentUser?.role === 'labour',
    [currentUser]
  );

  const value: UserContextValue = {
    currentUser,
    setCurrentUser,
    addKnownUser,
    findKnownUserByNameAndEmail,
    isCreator,
    canEditJob,
    canDeleteJob,
    canManageOffers,
    canCreateOffer,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
