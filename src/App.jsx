// replica-tinder-frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth.jsx';
import Account from './components/Account.jsx';
import Swiper from './components/Swiper.jsx';
import Matches from './components/Matches.jsx';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  // Nuevo estado para controlar la pestaña activa. Por defecto, 'swiper' (Encuentra a alguien).
  const [activeTab, setActiveTab] = useState('swiper'); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Si el usuario cierra sesión, regresa a la pantalla de autenticación y la pestaña por defecto.
      if (!session) {
        setActiveTab('swiper'); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ñinder</h1> {/* CAMBIADO: Nombre de la aplicación */}
        {session && (
          <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
        )}
      </header>
      {!session ? (
        <Auth />
      ) : (
        <div className="main-content">
          {/* Barra de navegación de pestañas */}
          <nav className="tab-navigation">
            <button
              className={activeTab === 'profile' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('profile')}
            >
              Tu Perfil
            </button>
            <button
              className={activeTab === 'swiper' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('swiper')}
            >
              Encuentra a alguien
            </button>
            <button
              className={activeTab === 'matches' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('matches')}
            >
              Tus Matches
            </button>
          </nav>

          {/* Renderizado condicional de componentes basado en la pestaña activa */}
          <div className="tab-content">
            {activeTab === 'profile' && <Account key={session.user.id} session={session} />}
            {activeTab === 'swiper' && <Swiper session={session} />}
            {activeTab === 'matches' && <Matches session={session} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
