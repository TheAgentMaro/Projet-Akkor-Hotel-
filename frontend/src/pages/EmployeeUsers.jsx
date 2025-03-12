import React, { useState, useContext } from 'react';
import { userApi } from '../services/api';
import AuthContext from '../context/AuthContext';

function EmployeeUsers() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur est un employé
  if (!user?.role || !['employee', 'admin'].includes(user.role)) {
    return <div className="text-center text-red-600">Accès non autorisé</div>;
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await userApi.searchUsers(searchQuery);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (err) {
      setError('Erreur lors de la recherche des utilisateurs');
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Recherche d'Utilisateurs</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par email, pseudo ou ID..."
            className="flex-1 border rounded px-4 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="bg-white shadow-md rounded">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Pseudo</th>
                <th className="py-3 px-6 text-left">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {searchResults.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{user.id}</td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">{user.pseudo}</td>
                  <td className="py-3 px-6 text-left">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !loading && (
        <div className="text-center text-gray-600">
          Aucun utilisateur trouvé
        </div>
      )}
    </div>
  );
}

export default EmployeeUsers;
