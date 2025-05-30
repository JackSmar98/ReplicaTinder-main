// replica-tinder-frontend/src/components/Account.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Account.css'; // Importa los estilos para el componente Account

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [bio, setBio] = useState(null);
  const [age, setAge] = useState(null);
  const [gender, setGender] = useState(null);
  const [lookingFor, setLookingFor] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    getProfile(); // Carga el perfil del usuario al montar el componente o cambiar la sesión
  }, [session]); // Dependencia de la sesión

  // Función para obtener el perfil del usuario desde Supabase
  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session; // Obtiene el objeto de usuario de la sesión

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, bio, age, gender, looking_for, avatar_url`)
        .eq('id', user.id) // Filtra por el ID del usuario actual
        .single(); // Espera un solo resultado

      if (error && status !== 406) { // 406 significa "no content", es decir, el perfil no existe
        throw error;
      }

      if (data) {
        // Si se encuentra el perfil, actualiza los estados
        setUsername(data.username);
        setBio(data.bio);
        setAge(data.age);
        setGender(data.gender);
        setLookingFor(data.looking_for);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert('Error cargando el perfil: ' + error.message);
      console.error('Error cargando el perfil:', error);
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  }

  // Función para actualizar o crear el perfil del usuario en Supabase
  async function updateProfile({ username, bio, age, gender, lookingFor, avatarUrl }) {
    try {
      setLoading(true);
      const { user } = session; // Obtiene el objeto de usuario de la sesión

      const updates = {
        id: user.id, // El ID del perfil es el mismo que el ID del usuario de autenticación
        email: user.email, // Incluir el email
        username,
        bio,
        age,
        gender,
        looking_for: lookingFor,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(), // Opcional: para registrar la última actualización
      };

      // Usa upsert para insertar si no existe o actualizar si ya existe
      let { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      alert('Perfil actualizado!'); // Mensaje de éxito
    } catch (error) {
      alert('Error actualizando el perfil: ' + error.message);
      console.error('Error actualizando el perfil:', error);
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  }

  // Generar placeholder si no hay avatar
  const getAvatarSrc = () => {
    if (avatarUrl && avatarUrl.trim()) {
      return avatarUrl;
    }
    const initial = username ? username.charAt(0).toUpperCase() : session.user.email.charAt(0).toUpperCase();
    return `https://placehold.co/200x200/FF5864/FFFFFF?text=${initial}`;
  };

  return (
    <div className="profile-container">
      {/* Header del perfil */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <img
              src={getAvatarSrc()}
              alt="Tu foto de perfil"
              className="profile-avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                const initial = username ? username.charAt(0).toUpperCase() : session.user.email.charAt(0).toUpperCase();
                e.target.src = `https://placehold.co/200x200/FF5864/FFFFFF?text=${initial}`;
              }}
            />
            <div className="avatar-overlay">
              <span>📸</span>
            </div>
          </div>
          <h2 className="profile-title">Mi Perfil</h2>
          <p className="profile-email">{session.user.email}</p>
        </div>
      </div>

      {/* Formulario en dos columnas */}
      <div className="profile-form">
        {/* Columna izquierda */}
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username || ''}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="¿Cómo te llamas?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">
              <span className="label-icon">🎂</span>
              Edad
            </label>
            <input
              id="age"
              type="number"
              value={age || ''}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="form-input"
              placeholder="Tu edad"
              min="18"
              max="99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">
              <span className="label-icon">⚧</span>
              Género
            </label>
            <select 
              id="gender" 
              value={gender || ''} 
              onChange={(e) => setGender(e.target.value)} 
              className="form-select"
            >
              <option value="">Selecciona tu género</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Non-binary">No binario</option>
            </select>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="looking_for">
              <span className="label-icon">💕</span>
              Buscando
            </label>
            <select 
              id="looking_for" 
              value={lookingFor || ''} 
              onChange={(e) => setLookingFor(e.target.value)} 
              className="form-select"
            >
              <option value="">¿Qué buscas?</option>
              <option value="Male">Masculino</option>
              <option value="Female">Femenino</option>
              <option value="Non-binary">No binario</option>
              <option value="Anyone">Cualquier persona</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="avatar_url">
              <span className="label-icon">🖼️</span>
              URL de tu foto
            </label>
            <input
              id="avatar_url"
              type="url"
              value={avatarUrl || ''}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="form-input"
              placeholder="https://ejemplo.com/tu-foto.jpg"
            />
          </div>

          {/* Biografía ocupa más espacio */}
          <div className="form-group">
            <label htmlFor="bio">
              <span className="label-icon">✍️</span>
              Cuéntanos sobre ti
            </label>
            <textarea
              id="bio"
              value={bio || ''}
              onChange={(e) => setBio(e.target.value)}
              className="form-textarea"
              placeholder="Escribe algo interesante sobre ti..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Botón de actualizar centrado */}
      <div className="form-actions">
        <button
          onClick={() => updateProfile({ username, bio, age, gender, lookingFor, avatarUrl })}
          disabled={loading}
          className="update-button"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Guardando...
            </>
          ) : (
            <>
              <span>💾</span>
              Actualizar perfil
            </>
          )}
        </button>
      </div>
    </div>
  );
}