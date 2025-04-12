import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Datos del formulario principal
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        permisos: ''
    });

    // Datos del formulario de contraseña
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(/*`http://localhost:8080/api/admin/users/${userId}`*/ `http://10.3.1.122:5000/api/admin/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar usuario');
                }

                const data = await response.json();
                setUser(data.user);
                setFormData({
                    nombre: data.user.nombre,
                    apellido: data.user.apellido,
                    email: data.user.email,
                    permisos: data.user.permisos
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(/*`http://localhost:8080/api/admin/users/${userId}`*/ `http://10.3.1.122:5000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar usuario');
            }

            setSuccess('Usuario actualizado exitosamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(/*`http://localhost:8080/api/admin/users/${userId}/reset-password`*/ `http://10.3.1.122:5000/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                // Si el servidor devuelve un error, intenta leer el mensaje de error
                let errorMessage = 'Error al actualizar contraseña';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setSuccess(data.message || 'Contraseña actualizada exitosamente');
            setShowPasswordForm(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating password:', err);
            setError(err.message || 'Error al actualizar contraseña');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center ">
            <div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Cargando usuario...</p>
            </div>
        </div>
    );

    if (error && !user) return (
        <div className="fixed inset-0 flex items-center justify-center ">
            <div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    Volver a la lista
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
                {/* Encabezado */}
                <div className="bg-emerald-600 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Editar Usuario: {user?.nombre} {user?.apellido}</h1>
                </div>

                {/* Mensajes de éxito/error */}
                {(success || error) && (
                    <div className={`px-6 py-3 ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {success || error}
                    </div>
                )}

                {/* Contenido principal */}
                <div className="p-6 overflow-auto" style={{ maxHeight: '70vh' }}>
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permisos</label>
                                <input
                                    type="text"
                                    name="permisos"
                                    value={formData.permisos}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showPasswordForm ? 'Ocultar' : 'Cambiar Contraseña'}
                            </button>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/users')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Volver
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Formulario de cambio de contraseña */}
                    {showPasswordForm && (
                        <form onSubmit={handlePasswordSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Cambiar Contraseña</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                                    >
                                        Actualizar Contraseña
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditUser;