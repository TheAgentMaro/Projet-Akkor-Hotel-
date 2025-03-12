import React, { useState, useContext } from 'react';
import { userApi, bookingApi } from '../services/api';
import AuthContext from '../context/AuthContext';

function EmployeeUsers() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Vérifier si la requête est vide
    if (!searchQuery.trim()) {
      setError('Veuillez saisir un terme de recherche');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSelectedUser(null);
      setUserBookings([]);
      setSearchResults([]);
      
      const response = await userApi.searchUsers(searchQuery);
      
      if (response.success) {
        setSearchResults(response.data);
        
        // Afficher un message si aucun résultat n'est trouvé
        if (response.data.length === 0) {
          setError(`Aucun utilisateur trouvé pour "${searchQuery}". Essayez un autre terme.`);
        }
      } else {
        setError(response.error || 'Erreur lors de la recherche des utilisateurs');
      }
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError('Erreur lors de la recherche des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      setLoadingBookings(true);
      setSelectedUser(selectedUser);
      setError('');
      
      // Vérifier que l'ID utilisateur est valide
      if (!selectedUser._id) {
        setError('ID utilisateur invalide');
        setUserBookings([]);
        return;
      }
      
      const response = await bookingApi.getUserBookings(selectedUser._id);
      
      if (response.success) {
        setUserBookings(response.data);
        
        // Message si aucune réservation n'est trouvée
        if (response.data.length === 0) {
          setError(`Aucune réservation trouvée pour ${selectedUser.pseudo}`);
        }
      } else {
        setError(response.error || 'Erreur lors du chargement des réservations');
        setUserBookings([]);
      }
    } catch (err) {
      console.error('Erreur chargement réservations:', err);
      setError('Erreur lors du chargement des réservations');
      setUserBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recherche d'Utilisateurs</h1>
        <div className="text-sm">
          <span className="text-gray-600">Connecté en tant que : </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom d'utilisateur (pseudo) ou email..."
                className="w-full pl-10 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 flex items-center ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche...
              </div>
            ) : (
              'Rechercher'
            )}
          </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md shadow-sm">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste des utilisateurs */}
        <div>
          {searchResults.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Résultats de la recherche</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {searchResults.map((userResult) => (
                  <div
                    key={userResult._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      selectedUser?._id === userResult._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleUserSelect(userResult)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{userResult.pseudo}</h3>
                        <p className="text-sm text-gray-500">{userResult.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userResult.role)}`}>
                        {userResult.role}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Inscrit le {formatDate(userResult.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !loading && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Essayez avec des termes de recherche différents
              </p>
            </div>
          )}
        </div>

        {/* Détails de l'utilisateur et ses réservations */}
        {selectedUser && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Détails de l'utilisateur</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {selectedUser.pseudo}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date d'inscription</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Réservations</h4>
                {loadingBookings ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userBookings.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{booking.hotel?.name}</h5>
                            <p className="text-sm text-gray-600">{booking.hotel?.location}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Check-in</p>
                            <p>{formatDate(booking.checkIn)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Check-out</p>
                            <p>{formatDate(booking.checkOut)}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="text-gray-500">Prix total</p>
                          <p className="font-medium">{booking.totalPrice}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucune réservation trouvée
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeUsers;
