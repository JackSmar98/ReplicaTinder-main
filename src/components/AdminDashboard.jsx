// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Crearemos este archivo para los estilos

export default function AdminDashboard({ session }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const navigate = useNavigate();

  // Verificar el rol del usuario actual y cargar datos si es admin
  useEffect(() => {
    const fetchUserRoleAndData = async () => {
      if (!session?.user) {
        navigate('/auth'); // Si no hay sesión, redirigir a auth
        return;
      }

      // 1. Obtener el rol del usuario actual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching user role:', profileError);
        navigate('/swiper'); // Redirigir si hay error o no se encuentra el perfil
        return;
      }

      setCurrentUserRole(profileData.role);

      // 2. Si no es admin, redirigir
      if (profileData.role !== 'admin') {
        alert('Acceso denegado. Esta área es solo para administradores.');
        navigate('/swiper');
        return;
      }

      // 3. Si es admin, cargar los datos de todos los perfiles
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, email, bio, age, gender, looking_for, avatar_url, role'); // Todos los campos que quieras mostrar/editar

        if (profilesError) {
          throw profilesError;
        }
        setProfiles(profilesData || []);
      } catch (error) {
        console.error('Error fetching profiles for admin:', error);
        alert('Error al cargar los perfiles de usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndData();
  }, [session, navigate]);

  const handleProfileUpdateChange = (userId, field, value) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === userId ? { ...profile, [field]: value } : profile
      )
    );
  };

  const saveProfileChanges = async (userId) => {
    const profileToUpdate = profiles.find(p => p.id === userId);
    if (!profileToUpdate) return;

    // Excluimos el email de la actualización directa aquí, ya que generalmente se maneja a través de Auth
    // y el trigger ya lo sincroniza. Si necesitas actualizar roles, inclúyelo.
    const { id, email, ...updatableFields } = profileToUpdate;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(updatableFields)
        .eq('id', userId);

      if (error) {
        throw error;
      }
      alert(`Perfil de ${profileToUpdate.username || profileToUpdate.email} actualizado.`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error al actualizar perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteUserProfile = async (userId, username) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el perfil de ${username || 'este usuario'} y todos sus datos asociados (swipes, matches)? Esta acción NO eliminará al usuario de Supabase Auth.`)) {
        return;
    }

    try {
        setLoading(true);
        // Eliminar de la tabla 'profiles'. Gracias a ON DELETE CASCADE en las tablas 'swipes' y 'matches'
        // se deberían eliminar los registros relacionados automáticamente.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            throw error;
        }

        setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== userId));
        alert(`Perfil de ${username || 'usuario'} eliminado de la tabla profiles.`);
        
        // Nota: Para eliminar completamente al usuario del sistema (incluyendo Supabase Auth),
        // necesitarías una función de Supabase Edge Function con permisos de service_role para llamar a supabase.auth.admin.deleteUser(userId)
        // Esto es más avanzado y requiere configuración adicional en Supabase.

    } catch (error) {
        console.error('Error deleting profile:', error);
        alert(`Error al eliminar perfil: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };


  if (loading || currentUserRole !== 'admin') {
    return <div className="loading-app">Cargando panel de administrador...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración de Usuarios</h2>
      {profiles.length === 0 ? (
        <p>No hay perfiles para mostrar.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Edad</th>
              <th>Género</th>
              <th>Buscando</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id}>
                <td>
                  <input
                    type="text"
                    value={profile.username || ''}
                    onChange={(e) => handleProfileUpdateChange(profile.id, 'username', e.target.value)}
                  />
                </td>
                <td>{profile.email}</td> {/* El email generalmente no se edita directamente aquí */}
                <td>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => handleProfileUpdateChange(profile.id, 'age', parseInt(e.target.value) || null)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={profile.gender || ''}
                    onChange={(e) => handleProfileUpdateChange(profile.id, 'gender', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={profile.looking_for || ''}
                    onChange={(e) => handleProfileUpdateChange(profile.id, 'looking_for', e.target.value)}
                  />
                </td>
                 <td>
                  <select 
                    value={profile.role || 'user'}
                    onChange={(e) => handleProfileUpdateChange(profile.id, 'role', e.target.value)}
                    disabled={profile.id === session.user.id} // Opcional: no permitir que el admin se quite el rol a sí mismo
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => saveProfileChanges(profile.id)} className="admin-button-save">
                    Guardar
                  </button>
                  <button 
                    onClick={() => deleteUserProfile(profile.id, profile.username)} 
                    className="admin-button-delete"
                    disabled={profile.id === session.user.id} // No permitir que el admin se elimine a sí mismo desde aquí
                  >
                    Eliminar Perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}