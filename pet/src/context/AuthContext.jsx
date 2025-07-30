import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../Db/firebaseConfig'; // ajuste o caminho se necessário

// Cria o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para acessar o contexto
export const useAuth = () => useContext(AuthContext);

// Provider que envolve a aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitora o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função de registro de novo usuário
  const register = async (email, password, userData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;

    // Atualiza nome e foto no Firebase Auth
    await updateProfile(firebaseUser, {
      displayName: userData.nome,
      photoURL: userData.foto || '',
    });

    // Cria usuário na API backend
    await fetch('http://localhost:3000/api/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Id: firebaseUser.uid,
        Nome: userData.nome,
        Email: userData.email,
        Telefone: userData.telefone,
        Endereco: userData.endereco,
        IsAdmin: false,
        Foto: userData.foto || '',
      }),
    });

    setUser({ ...firebaseUser, ...userData });
  };

  // Função de login
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
  };

  // Função de logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
