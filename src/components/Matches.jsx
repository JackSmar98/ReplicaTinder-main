// replica-tinder-frontend/src/components/Matches.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Matches.css'; // Importa los estilos para el componente Matches

export default function Matches({ session }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches(); // Carga los matches al montar el componente

    // Suscribirse a cambios en la tabla 'matches' en tiempo real
    // Esto asegura que la lista de matches se actualice automáticamente
    const subscription = supabase
      .channel('public:matches') // Nombre del canal para la tabla matches
      .on('postgres_changes', {
        event: '*', // Escucha INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'matches',
        // Filtra para solo recibir cambios relevantes a los matches del usuario actual
        filter: `user1_id=eq.${session.user.id},user2_id=eq.${session.user.id}`,
      }, payload => {
        console.log('Cambio recibido en matches!', payload);
        fetchMatches(); // Refrescar la lista de matches al recibir un cambio
      })
      .subscribe(); // Inicia la suscripción

    // Limpiar la suscripción al desmontar el componente
    return () => supabase.removeChannel(subscription);
  }, [session]); // Dependencia de la sesión

  // Función para obtener los matches del usuario desde Supabase
  async function fetchMatches() {
    try {
      setLoading(true);
      setError(null);

      // Obtener los matches donde el usuario actual es user1_id o user2_id
      // Se usa .select con "foreign table joins" para obtener los datos de los perfiles relacionados
      // ¡IMPORTANTE: Los comentarios dentro de la cadena de select han sido ELIMINADOS!
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          matched_at,
          user1_id,
          user2_id,
          profile1:user1_id (username, avatar_url, age),
          profile2:user2_id (username, avatar_url, age)
        `)
        // Filtra los matches donde el usuario actual es user1_id O user2_id
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);

      if (error) {
        throw error;
      }

      setMatches(data); // Actualiza el estado con los matches obtenidos
    } catch (err) {
      console.error('Error fetching matches:', err.message);
      setError('Error cargando matches: ' + err.message);
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  }

  if (loading) return <p className="loading-message">Cargando matches...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!matches.length) return <p className="no-matches-message">Aún no tienes matches. ¡Sigue deslizando!</p>;

  return (
    <div className="matches-grid">
      {matches.map((match) => {
        // Determina cuál de los dos perfiles en el match es el del "otro" usuario
        const matchedProfile = match.user1_id === session.user.id ? match.profile2 : match.profile1;
        return (
          <div key={match.id} className="match-card">
            {/* Muestra el avatar del perfil con el que se hizo match */}
            <img
              src={matchedProfile.avatar_url || `https://placehold.co/100x100/FF5864/FFFFFF?text=${matchedProfile.username.charAt(0).toUpperCase()}`}
              alt={matchedProfile.username}
              className="match-avatar"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/FF5864/FFFFFF?text=${matchedProfile.username.charAt(0).toUpperCase()}`; }}
            />
            <div className="match-info">
              <h4>{matchedProfile.username}, {matchedProfile.age}</h4>
              <p>Match desde: {new Date(match.matched_at).toLocaleDateString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
