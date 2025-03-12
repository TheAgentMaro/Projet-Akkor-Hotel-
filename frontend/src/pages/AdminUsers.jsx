import React, { useState, useEffect, useContext } from 'react';
import { userApi } from '../services/api';
import AuthContext from '../context/AuthContext';

function AdminUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userApi.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Erreur loadUsers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError('');
      const response = await userApi.updateUserRole(userId, newRole);
      if (response.success) {
        setSuccessMessage('Rôle mis à jour avec succès');
        loadUsers();
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du rôle');
    }
  };

  if (!user?.isAdmin) {
    return <div className="text-center text-red-600">Accès non autorisé</div>;
  }

  if (loading) return <div className="text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Pseudo</th>
              <th className="py-3 px-6 text-left">Rôle</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {user.id}
                </td>
                <td className="py-3 px-6 text-left">
                  {user.email}
                </td>
                <td className="py-3 px-6 text-left">
                  {user.pseudo}
                </td>
                <td className="py-3 px-6 text-left">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                    disabled={user.id === user.id} // Ne pas permettre de changer son propre rôle
                  >
                    <option value="user">Utilisateur</option>
                    <option value="employee">Employé</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <button
                      onClick={() => handleViewDetails(user.id)}
                      className="transform hover:text-blue-500 hover:scale-110 mr-3"
                    >
                      Détails
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
