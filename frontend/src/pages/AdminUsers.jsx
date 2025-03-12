import React, { useState, useEffect, useContext } from 'react';
import { userApi, bookingApi } from '../services/api';
import AuthContext from '../context/AuthContext';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';

const userSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
  pseudo: yup.string().min(3, 'Minimum 3 caractères').required('Pseudo requis'),
  password: yup.string().min(6, 'Minimum 6 caractères'),
  role: yup.string().oneOf(['user', 'employee', 'admin'], 'Rôle invalide').required('Rôle requis')
});

function AdminUsers() {
  const { user, hasRole, roleBadgeColor, roleLabel } = useContext(AuthContext);
  const navigate = useNavigate();
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

  // Vérifier les permissions
  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/');
      return;
    }
  }, [hasRole, navigate]);

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

    if (!window.confirm(`Êtes-vous sûr de vouloir modifier le rôle de cet utilisateur en "${roleLabel[newRole]}" ?`)) {
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <div className="text-sm">
          <span className="text-gray-600">Connecté en tant que : </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColor}`}>
            {roleLabel}
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
            {users.map(u => (
              <div
                key={u.id}
                className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  selectedUser?.id === u.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleUserSelect(u)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{u.pseudo}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColor[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                    {u.id !== user.id && (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="employee">Employé</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails de l'utilisateur sélectionné */}
        {selectedUser && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Détails de l'utilisateur
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {editMode ? 'Annuler' : 'Modifier'}
                  </button>
                  {selectedUser.id !== user.id && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
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
                    >
                      <option value="user">Utilisateur</option>
                      <option value="employee">Employé</option>
                      <option value="admin">Admin</option>
                    </select>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Informations</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p><span className="font-medium">Pseudo:</span> {selectedUser.pseudo}</p>
                      <p>
                        <span className="font-medium">Rôle:</span>{' '}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColor[selectedUser.role]}`}>
                          {roleLabel[selectedUser.role]}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Créé le:</span>{' '}
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                  </div>

                  {loadingBookings ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium">Réservations</h3>
                      {userBookings.length === 0 ? (
                        <p className="text-gray-500 mt-2">Aucune réservation</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {userBookings.map(booking => (
                            <div
                              key={booking.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <p className="font-medium">{booking.hotel.name}</p>
                              <p className="text-sm text-gray-600">
                                Du {formatDate(booking.checkIn)} au {formatDate(booking.checkOut)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: {booking.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
