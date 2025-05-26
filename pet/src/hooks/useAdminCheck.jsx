import { useEffect, useState } from "react";
import { auth } from "../Db/firebaseConfig";


export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    async function checkAdmin() {
      try {
        const response = await fetch(`http://localhost:5005/api/Usuario/admincheck/email/${encodeURIComponent(user.email)}`);
        if (!response.ok) throw new Error("Erro ao checar admin");
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error(error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}
