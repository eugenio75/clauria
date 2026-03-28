import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useIntusAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);

      if (hasInitialized) {
        setLoading(false);
      }
    });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setUser(session?.user ?? null);
      hasInitialized = true;
      setLoading(false);
    };

    void init();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isReady: !loading };
}
