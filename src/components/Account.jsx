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

  return (
    <div className="profile-form-container">
      <h3>Tu Perfil</h3>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        {/* El email del usuario no se puede cambiar desde aquí */}
        <input id="email" type="text" value={session.user.email} disabled className="form-input disabled-input" />
      </div>
      <div className="form-group">
        <label htmlFor="username">Nombre de Usuario</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="bio">Biografía</label>
        <textarea
          id="bio"
          value={bio || ''}
          onChange={(e) => setBio(e.target.value)}
          className="form-textarea"
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="age">Edad</label>
        <input
          id="age"
          type="number"
          value={age || ''}
          onChange={(e) => setAge(parseInt(e.target.value))}
          className="form-input"
          min="18" // Edad mínima razonable para una app como Tinder
          max="99"
        />
      </div>
      <div className="form-group">
        <label htmlFor="gender">Género</label>
        <select id="gender" value={gender || ''} onChange={(e) => setGender(e.target.value)} className="form-select">
          <option value="">Selecciona</option>
          <option value="Male">Masculino</option>
          <option value="Female">Femenino</option>
          <option value="Non-binary">No binario</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="looking_for">Buscando</label>
        <select id="looking_for" value={lookingFor || ''} onChange={(e) => setLookingFor(e.target.value)} className="form-select">
          <option value="">Selecciona</option>
          <option value="Male">Masculino</option>
          <option value="Female">Femenino</option>
          <option value="Non-binary">No binario</option>
          <option value="Anyone">Cualquiera</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="avatar_url">URL de Avatar</label>
        <input
          id="avatar_url"
          type="text"
          value={avatarUrl || ''}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="form-input"
          placeholder="Ej: https://placehold.co/150x150"
        />
      </div>

      <div>
        <button
          onClick={() => updateProfile({ username, bio, age, gender, lookingFor, avatarUrl })}
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Guardando...' : 'Actualizar perfil'}
        </button>
      </div>
    </div>
  );
}