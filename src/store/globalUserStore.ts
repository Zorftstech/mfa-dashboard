import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TLoystarUser } from "types";

// Define the user state interface
interface userState {
  user: TLoystarUser | null;
  loading:boolean;
  setUser: (user: TLoystarUser | null) => void;
}

// Create the user store
const useUserStore = create<userState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user: TLoystarUser | null) => set({ user, loading: false }),
    }),
    {
      name: "user", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // specify the storage mechanism
    }
  )
);

export default useUserStore;
