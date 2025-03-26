import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al cargar usuarios');
                }

                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleEditUser = (userId) => {
        navigate(`/admin/users/edit/${userId}`);
    };

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60">
            <div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Cargando usuarios...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60">
            <div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
                <p className="text-red-500">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center  p-4">
            <div className="w-full max-w-6xl bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
                {/* Encabezado */}
                <div className="bg-emerald-600 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Administración de Usuarios</h1>
                </div>

                {/* Contenido principal */}
                <div className="p-6 overflow-auto" style={{ maxHeight: '70vh' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.nombre} {user.apellido}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.permisos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleEditUser(user.id)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pie de página con botón de volver */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                    <Link
                        to="/home"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;