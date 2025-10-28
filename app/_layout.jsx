import { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Listen to Supabase auth state changes
    const unsubscribe = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      console.log("Auth state changed:", user?.id);

      if (user) {
        // Set authenticated user
        setAuth(user);

        try {
          // Fetch full user data from your database
          const res = await getUserData(user.id);
          if (res.success) {
            console.log("User data fetched:", res.data);
            setUserData(res.data);
          } else {
            console.warn("Failed to fetch user data:", res.error);
            setUserData(null);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUserData(null);
        }

        // Redirect to Dashboard
        router.replace("/Dashboard");
      } else {
        // No user logged in
        setAuth(null);
        setUserData(null);
        router.replace("/welcome");
      }
    });

    // Cleanup on unmount
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);
  

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default _layout;
