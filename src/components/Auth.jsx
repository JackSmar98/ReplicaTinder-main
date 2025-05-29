// replica-tinder-frontend/src/components/Auth.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './Auth.css'; //

export default function Auth() {
  const [loading, setLoading] = useState(false); //
  const [email, setEmail] = useState(''); //
  const [password, setPassword] = useState(''); //
  const [isSignUp, setIsSignUp] = useState(false); //
  const navigate = useNavigate(); // Hook para la navegación

  const handleAuth = async (event) => {
    event.preventDefault(); //
    setLoading(true); //

    const authMethod = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    const { error } = await authMethod({ email, password }); //

    if (error) {
      alert(error.message); //
    } else {
      // La alerta de éxito ya no es necesaria aquí, la redirección es suficiente.
      // El estado de la sesión se actualizará globalmente por el listener en App.jsx
      // alert('¡Operación exitosa! Has ' + (isSignUp ? 'registrado' : 'iniciado sesión') + ' correctamente.');
      // Redirige al usuario a la página de "swiper" después de iniciar sesión o registrarse.
      // Podrías redirigir a "/profile" después de isSignUp si quieres que completen su perfil.
      navigate('/swiper'); // O '/profile' si es isSignUp y quieres que editen su perfil primero
    }
    setLoading(false); //
  };

  return (
    <div className="auth-container"> {/* */}
      <h2>{isSignUp ? 'Registrarse' : 'Iniciar Sesión'}</h2> {/* */}
      <form onSubmit={handleAuth} className="auth-form"> {/* */}
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        /> {/* */}
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        /> {/* */}
        <button type="submit" disabled={loading} className="auth-button"> {/* */}
          {loading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')} {/* */}
        </button>
      </form>
      <button className="toggle-auth" onClick={() => setIsSignUp(!isSignUp)}> {/* */}
        {isSignUp ? 'Ya tengo una cuenta' : 'Necesito una cuenta'} {/* */}
      </button>
    </div>
  );
}