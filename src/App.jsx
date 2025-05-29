// replica-tinder-frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './components/Auth.jsx';
import Account from './components/Account.jsx';
import Swiper from './components/Swiper.jsx';
import Matches from './components/Matches.jsx';
import AdminDashboard from './components/AdminDashboard.jsx'; // Importar AdminDashboard
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // Para guardar el perfil del usuario, incluido el rol

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
        setUserProfile(null); // Limpiar perfil si no hay sesión
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
        setUserProfile(null); // Limpiar perfil al cerrar sesión
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*') // Puedes seleccionar solo 'role' si es lo único que necesitas aquí
        .eq('id', userId)
        .single();
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null); // Asegúrate de limpiar si hay error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null); // Limpiar el perfil localmente al cerrar sesión
    // La redirección la manejará el cambio de estado de la sesión
  };

  if (loading) {
    return <div className="loading-app">Cargando Ñinder...</div>;
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Ñinder</h1>
          {session && (
            <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
          )}
        </header>
        <div className="main-content-router">
          <Routes>
            {!session ? (
              <>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            ) : (
              <>
                <Route path="/profile" element={<Account key={session.user.id} session={session} />} />
                <Route path="/swiper" element={<Swiper session={session} />} />
                <Route path="/matches" element={<Matches session={session} />} />
                
                {/* Ruta de Administrador protegida */}
                {userProfile && userProfile.role === 'admin' && (
                  <Route path="/admin" element={<AdminDashboard session={session} />} />
                )}

                <Route path="/" element={<Navigate to="/swiper" replace />} />
                {/* Si la ruta no es de admin y no coincide, va a swiper */}
                <Route path="*" element={userProfile && userProfile.role === 'admin' && window.location.pathname === '/admin' ? null : <Navigate to="/swiper" replace />} />

              </>
            )}
          </Routes>
        </div>

        {session && (
          <nav className="tab-navigation">
            <NavLink
              to="/profile"
              className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}
            >
              Tu Perfil
            </NavLink>
            <NavLink
              to="/swiper"
              className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}
            >
              Encuentra a alguien
            </NavLink>
            <NavLink
              to="/matches"
              className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}
            >
              Tus Matches
            </NavLink>
            {/* Enlace al panel de admin si el usuario es admin */}
            {userProfile && userProfile.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}
              >
                Admin
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </Router>
  );
}

export default App;