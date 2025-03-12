import React, { useState, useEffect, useContext } from 'react';
import { userApi, bookingApi } from '../services/api';
import AuthContext from '../context/AuthContext';
import * as yup from 'yup';

const userSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
  pseudo: yup.string().min(3, 'Minimum 3 caractères').required('Pseudo requis'),
  password: yup.string().min(6, 'Minimum 6 caractères'),
  role: yup.string().oneOf(['user', 'employee', 'admin'], 'Rôle invalide').required('Rôle requis')
});

function AdminUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    pseudo: '',
    password: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});

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

  const handleUserSelect = async (selectedUser) => {
    try {
      setLoadingBookings(true);
      setSelectedUser(selectedUser);
      setEditForm({
        email: selectedUser.email,
        pseudo: selectedUser.pseudo,
        password: '',
        role: selectedUser.role
      });
      const response = await bookingApi.getUserBookings(selectedUser.id);
      if (response.success) {
        setUserBookings(response.data);
      }
    } catch (err) {
      console.error('Erreur chargement réservations:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user.id) {
      setError('Vous ne pouvez pas modifier votre propre rôle');
      return;
    }

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

  const handleDeleteUser = async () => {
    if (!selectedUser || selectedUser.id === user.id) {
      setError('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    try {
      setError('');
      const response = await userApi.deleteUser(selectedUser.id);
      if (response.success) {
        setSuccessMessage('Utilisateur supprimé avec succès');
        setSelectedUser(null);
        setShowDeleteConfirm(false);
        loadUsers();
      }
    } catch (err) {
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await userSchema.validate(editForm, { abortEarly: false });
      const response = await userApi.updateUser(selectedUser.id, editForm);
      if (response.success) {
        setSuccessMessage('Utilisateur mis à jour avec succès');
        setEditMode(false);
        loadUsers();
      }
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach(error => {
          errors[error.path] = error.message;
        });
        setFormErrors(errors);
      } else {
        setError('Erreur lors de la mise à jour de l\'utilisateur');
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <div className="text-sm">
          <span className="text-gray-600">Connecté en tant que : </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste des utilisateurs */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Liste des utilisateurs</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((userItem) => (
              <div
                key={userItem.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  selectedUser?.id === userItem.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleUserSelect(userItem)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{userItem.pseudo}</h3>
                    <p className="text-sm text-gray-500">{userItem.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userItem.role)}`}>
                    {userItem.role}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Inscrit le {formatDate(userItem.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails et édition de l'utilisateur */}
        {selectedUser && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editMode ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur'}
                </h2>
                <div className="space-x-2">
                  {!editMode && (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        disabled={selectedUser.id === user.id}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              {editMode ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pseudo</label>
                    <input
                      type="text"
                      value={editForm.pseudo}
                      onChange={(e) => setEditForm({ ...editForm, pseudo: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {formErrors.pseudo && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.pseudo}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nouveau mot de passe (laisser vide pour ne pas modifier)
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rôle</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={selectedUser.id === user.id}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="employee">Employé</option>
                      <option value="admin">Admin</option>
                    </select>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
