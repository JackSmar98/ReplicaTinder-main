// replica-tinder-frontend/src/components/Swiper.js
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './Swiper.css'; // Importa los estilos para el componente Swiper

export default function Swiper({ session }) {
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener perfiles para deslizar
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener perfiles que no son el del usuario actual
      // Como RLS está deshabilitado, debemos filtrar manualmente aquí
      const { data, error } = await supabase
        .from('profiles')
        .select(`id, username, bio, age, gender, avatar_url, looking_for`)
        .neq('id', session.user.id); // Excluye el propio perfil del usuario

      if (error) {
        throw error;
      }

      // Filtrar perfiles sobre los que ya se ha deslizado
      const { data: existingSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', session.user.id);

      if (swipesError) {
        throw swipesError;
      }

      const swipedIds = new Set(existingSwipes.map(swipe => swipe.swiped_id));
      const filteredProfiles = data.filter(profile => !swipedIds.has(profile.id));

      setProfiles(filteredProfiles);
      setCurrentProfileIndex(0); // Reiniciar el índice al cargar nuevos perfiles
    } catch (err) {
      console.error('Error fetching profiles:', err.message);
      setError('Error cargando perfiles: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [session]); // Dependencia de la sesión

  useEffect(() => {
    fetchProfiles(); // Llama a la función al montar el componente
  }, [fetchProfiles]); // Dependencia de fetchProfiles

  // Función para manejar un swipe (like o dislike)
  const handleSwipe = async (isLike) => {
    if (!profiles.length || currentProfileIndex >= profiles.length) return; // No hay perfiles o ya se vieron todos

    const swipedProfile = profiles[currentProfileIndex];

    try {
      // Llama a la función de la base de datos para manejar el swipe y el match
      const { data, error } = await supabase.rpc('handle_swipe_and_match', {
        p_swiped_id: swipedProfile.id,
        p_is_like: isLike,
      });

      if (error) {
        throw error;
      }

      const result = data[0]; // La función RPC devuelve un array de objetos
      if (result && result.is_new_match) {
        alert(`¡Es un MATCH con ${swipedProfile.username}!`);
        // Aquí podrías agregar lógica para actualizar la lista de matches o mostrar una notificación
      } else if (isLike && !result.is_new_match) {
        console.log(`Like a ${swipedProfile.username}, pero no hay match aún.`);
      } else if (!isLike) {
        console.log(`Dislike a ${swipedProfile.username}`);
      }

    } catch (err) {
      console.error('Error al registrar el swipe:', err.message);
      alert('Error al registrar el swipe: ' + err.message);
    } finally {
      // Pasa al siguiente perfil después de cada swipe
      setCurrentProfileIndex((prevIndex) => prevIndex + 1);
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  if (loading) return <p className="loading-message">Cargando perfiles...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!currentProfile) return <p className="no-profiles-message">No hay más perfiles para mostrar por ahora. ¡Vuelve más tarde!</p>;

  return (
    <div className="swiper-card">
      {/* Muestra la imagen del avatar si existe, si no, un placeholder */}
      <img
        src={currentProfile.avatar_url || `https://placehold.co/320x320/FF5864/FFFFFF?text=${currentProfile.username.charAt(0).toUpperCase()}`}
        alt={currentProfile.username}
        className="profile-avatar"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/320x320/FF5864/FFFFFF?text=${currentProfile.username.charAt(0).toUpperCase()}`; }}
      />
      <div className="profile-info">
        <h2>{currentProfile.username}, {currentProfile.age}</h2>
        <p>{currentProfile.bio}</p>
        <p>Género: {currentProfile.gender} | Buscando: {currentProfile.looking_for}</p>
      </div>
      <div className="swiper-actions">
        {/* Botón de dislike */}
        <button className="dislike-button" onClick={() => handleSwipe(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        {/* Botón de like */}
        <button className="like-button" onClick={() => handleSwipe(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
    </div>
  );
}
