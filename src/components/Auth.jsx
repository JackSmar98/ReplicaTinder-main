// replica-tinder-frontend/src/components/Auth.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      // Mensaje de éxito más genérico, ya que la confirmación de email está deshabilitada
      alert('¡Operación exitosa! Has ' + (isSignUp ? 'registrado' : 'iniciado sesión') + ' correctamente.');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Registrarse' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleAuth} className="auth-form">
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
        </button>
      </form>
      <button className="toggle-auth" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Ya tengo una cuenta' : 'Necesito una cuenta'}
      </button>
    </div>
  );
}
