import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useIntusAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    console.log("useIntusAuth: init, hash=", window.location.hash);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      console.log("getSession result:", session?.user?.email, error);
      const newUser = session?.user ?? null;
      if (newUser?.is_anonymous) localStorage.setItem("intus_anon_id", newUser.id);
      setUser(newUser);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      console.log("onAuthStateChange:", event, session?.user?.email);
      const newUser = session?.user ?? null;
      if (newUser?.is_anonymous) localStorage.setItem("intus_anon_id", newUser.id);
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isReady: !loading };
}
