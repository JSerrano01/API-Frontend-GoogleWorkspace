import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = (setAuthState) => {
    const navigate = useNavigate();
    const [activeForm, setActiveForm] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [results, setResults] = useState(null);
    const [tokenExpired, setTokenExpired] = useState(false);

    // Verificar token al cargar el componente
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    // Dentro del componente Home, añade este estado:
    const [userPermissions, setUserPermissions] = useState([]);

    // Añade este efecto para cargar los permisos:
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/user/permissions', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setUserPermissions(data.permisos);
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };

        fetchPermissions();
    }, []);

    // Datos del formulario individual
    const [individualUser, setIndividualUser] = useState({
        email: '',
        given_name: '',
        family_name: '',
        employee_id: ''
    });

    const handleLogout = () => {
        try {
            // Limpiar todo
            localStorage.clear();

            // Redirigir
            if (setAuthState) {
                setAuthState({ isAuthenticated: false, checked: true });
            }

            // Doble método para garantizar funcionamiento
            navigate('/', { replace: true });
            setTimeout(() => window.location.reload(), 100);
        } catch (error) {
            console.error("Error en logout:", error);
            window.location.href = '/';
        }
    };

    // Función para manejar errores de token
    const handleTokenError = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTokenExpired(true);
        setMessages(['Tu sesión ha expirado. Por favor, inicia sesión nuevamente.']);
        setTimeout(() => navigate('/'), 3000);
    };

    // Alternar formularios
    const toggleForm = (formId) => {
        // Si ya está activo, lo desactiva
        if (activeForm === formId) {
            setActiveForm(null);
        } else {
            setActiveForm(formId);
        }
        setMessages([]);
        setResults(null);
        setTokenExpired(false);
    };

    // Manejar cambios en el formulario individual
    const handleIndividualChange = (e) => {
        const { name, value } = e.target;
        setIndividualUser(prev => ({ ...prev, [name]: value }));
    };

    // Verificar si un usuario existe antes de crearlo
    const checkUserExists = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleTokenError();
                return { exists: false };
            }

            const response = await fetch('http://localhost:8080/api/users/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (response.status === 401) {
                handleTokenError();
                return { exists: false };
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al verificar usuario');
            }

            return data;
        } catch (error) {
            console.error('Error al verificar usuario:', error);
            setMessages([error.message]);
            return { exists: false };
        }
    };

    // Enviar formulario individual
    const handleIndividualSubmit = async (e) => {
        e.preventDefault();
        if (tokenExpired) return;

        setLoading(true);
        setMessages([]);
        setResults(null);

        try {
            // 1. Primero verificamos si el usuario existe
            const checkResult = await checkUserExists({
                email: individualUser.email,
                employee_id: individualUser.employee_id,
                given_name: individualUser.given_name,
                family_name: individualUser.family_name
            });

            if (checkResult.exists) {
                setMessages([`El usuario ya existe: ${checkResult.email} (${checkResult.reason})`]);
                setLoading(false);
                return;
            }

            // 2. Si no existe, procedemos a crearlo
            const token = localStorage.getItem('token');
            if (!token) {
                handleTokenError();
                return;
            }

            const response = await fetch('http://localhost:8080/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(individualUser)
            });

            if (response.status === 401) {
                handleTokenError();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear usuario');
            }

            setMessages([data.message]);
            setIndividualUser({
                email: '',
                given_name: '',
                family_name: '',
                employee_id: ''
            });
        } catch (error) {
            setMessages([error.message]);
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambio de archivo Excel
    const handleFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };

    // Manejar subida de archivo Excel
    const handleExcelSubmit = async (e) => {
        e.preventDefault();
        if (tokenExpired) return;

        setLoading(true);
        setMessages([]);
        setResults(null);

        if (!excelFile) {
            setMessages(['Por favor, selecciona un archivo Excel']);
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleTokenError();
                return;
            }

            const formData = new FormData();
            formData.append('file', excelFile);

            const response = await fetch('http://localhost:8080/api/users/bulk-create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 401) {
                handleTokenError();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al procesar archivo');
            }

            // Procesar resultados
            setResults(data.results);
            setMessages([
                `Proceso completado: ${data.created} usuarios creados exitosamente`,
                `Total procesados: ${data.total}`,
                `Errores: ${data.total - data.created}`
            ]);
        } catch (error) {
            setMessages([error.message]);
        } finally {
            setLoading(false);
            setExcelFile(null);
            document.querySelector('input[type="file"]').value = '';
        }
    };

    // Descargar plantilla de Excel
    const downloadTemplate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/download-template');
            if (!response.ok) {
                throw new Error('No se pudo descargar la plantilla');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Plantilla_Usuarios.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setMessages([error.message]);
        }
    };

    const handleExistingIdSubmit = async (e) => {
        e.preventDefault();
        if (tokenExpired) return;

        setLoading(true);
        setMessages([]);
        setResults(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleTokenError();
                return;
            }

            const response = await fetch('http://localhost:8080/api/users/create-with-existing-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(individualUser)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear usuario');
            }

            setMessages([data.message]);
            setIndividualUser({
                email: '',
                given_name: '',
                family_name: '',
                employee_id: ''
            });
        } catch (error) {
            setMessages([error.message]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center p-4 relative"> {/* Cambiado items-center a items-start */}
            {/* Contenedor principal */}
            <div className="w-full max-w-4xl bg-white bg-opacity-50 rounded-xl shadow-2xl p-8 relative z-10 mb-8"> {/* Añadido mb-8 */}
                {/* Mensaje de token expirado */}
                {tokenExpired && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>{messages[0]}</p>
                    </div>
                )}

                <div className="flex justify-end mb-6 gap-2">
                    {userPermissions.includes('admin') && (
                        <Link
                            to="/admin/users"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            disabled={tokenExpired}
                        >
                            Administrador
                        </Link>
                    )}
                    {userPermissions.includes('admin') && (
                        <Link
                            to="/admin/users/search"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            disabled={tokenExpired}
                        >
                            Buscar Usuarios
                        </Link>
                    )}
                    <Link
                        to="/change-password"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        disabled={tokenExpired}
                    >
                        Cambiar Contraseña Local
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        disabled={tokenExpired}
                    >
                        Cerrar Sesión
                    </button>
                </div>

                {/* Logo y título */}
                <div className="text-center mb-8">
                    <img
                        src="/images/Logo_Google.png"
                        alt="Logo Google"
                        className="h-16 mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Creación de Usuarios<br />Google Workspace
                    </h1>
                </div>

                {/* Contenedor de botones principales */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeForm === 'existing-id'
                            ? 'bg-purple-700 text-white shadow-md'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                            } ${tokenExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !tokenExpired && toggleForm('existing-id')}
                        disabled={tokenExpired}
                    >
                        Crear con ID Existente
                    </button>

                    <button
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeForm === 'individual'
                            ? 'bg-emerald-700 text-white shadow-md'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } ${tokenExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !tokenExpired && toggleForm('individual')}
                        disabled={tokenExpired}
                    >
                        Crear Usuario Individual
                    </button>

                    <button
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeForm === 'excel'
                            ? 'bg-blue-700 text-white shadow-md'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            } ${tokenExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !tokenExpired && toggleForm('excel')}
                        disabled={tokenExpired}
                    >
                        Crear Masiva Usuarios
                    </button>
                </div>

                {/* Formulario para usuario con ID existente */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out mb-6 ${activeForm === 'existing-id' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Usuario con ID Existente</h2>
                        <form onSubmit={handleExistingIdSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="existing-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo:
                                    </label>
                                    <input
                                        type="email"
                                        id="existing-email"
                                        name="email"
                                        value={individualUser.email}
                                        onChange={handleIndividualChange}
                                        placeholder="nombre.apellido@colmayor.edu.co"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="existing-given_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre:
                                    </label>
                                    <input
                                        type="text"
                                        id="existing-given_name"
                                        name="given_name"
                                        value={individualUser.given_name}
                                        onChange={handleIndividualChange}
                                        placeholder="Nombre"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="existing-family_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido:
                                    </label>
                                    <input
                                        type="text"
                                        id="existing-family_name"
                                        name="family_name"
                                        value={individualUser.family_name}
                                        onChange={handleIndividualChange}
                                        placeholder="Apellido"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="existing-employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee ID:
                                    </label>
                                    <input
                                        type="text"
                                        id="existing-employee_id"
                                        name="employee_id"
                                        value={individualUser.employee_id}
                                        onChange={handleIndividualChange}
                                        placeholder="Cedula"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                            </div>
                            <div className="mb-4 text-sm text-gray-600">
                                <p>Contraseña por defecto es "Colmayor1946"</p>
                                <p className="text-red-500">Nota: Este formulario permite crear usuarios aunque el Employee ID ya exista</p>
                            </div>
                            <button
                                type="submit"
                                disabled={tokenExpired || loading}
                                className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors duration-200 ${(tokenExpired || loading) ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Procesando...' : 'Crear Usuario'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Formulario de usuario individual */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out mb-6 ${activeForm === 'individual' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Usuario Individual</h2>
                        <form onSubmit={handleIndividualSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo:
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={individualUser.email}
                                        onChange={handleIndividualChange}
                                        placeholder="nombre.apellido@colmayor.edu.co"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="given_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre:
                                    </label>
                                    <input
                                        type="text"
                                        id="given_name"
                                        name="given_name"
                                        value={individualUser.given_name}
                                        onChange={handleIndividualChange}
                                        placeholder="Nombre"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="family_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido:
                                    </label>
                                    <input
                                        type="text"
                                        id="family_name"
                                        name="family_name"
                                        value={individualUser.family_name}
                                        onChange={handleIndividualChange}
                                        placeholder="Apellido"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee ID:
                                    </label>
                                    <input
                                        type="text"
                                        id="employee_id"
                                        name="employee_id"
                                        value={individualUser.employee_id}
                                        onChange={handleIndividualChange}
                                        placeholder="Cedula"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={tokenExpired || loading}
                                    />
                                </div>
                            </div>
                            <div className="mb-4 text-sm text-gray-600">
                                <p>Contraseña por defecto es "Colmayor1946"</p>
                            </div>
                            <button
                                type="submit"
                                disabled={tokenExpired || loading}
                                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors duration-200 ${(tokenExpired || loading) ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Procesando...' : 'Crear Usuario'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Formulario para subir Excel */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out mb-6 ${activeForm === 'excel' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Masiva Usuarios</h2>
                        <div className="mb-4">
                            <p className="text-sm text-gray-700">Formato en Excel(.xlsx). Plantilla:</p>
                            <p className="text-sm text-red-600 mt-1">NOTA: Si en "correo" existe una ñ, cambiarla por una n</p>
                            <button
                                onClick={downloadTemplate}
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors duration-200"
                                disabled={tokenExpired}
                            >
                                Descargar Plantilla
                            </button>
                        </div>
                        <form onSubmit={handleExcelSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Archivo Excel:
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                    required
                                    className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                    disabled={tokenExpired || loading}
                                />
                            </div>
                            <div className="mb-4 text-sm text-gray-600">
                                <p>Contraseña por defecto es "Colmayor1946"</p>
                            </div>
                            <button
                                type="submit"
                                disabled={tokenExpired || loading}
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 ${(tokenExpired || loading) ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Procesando...' : 'Subir Excel'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mostrar resultados */}
                {(messages.length > 0 || results) && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6 max-h-96 overflow-y-auto"> {/* Añadido max-h-96 y overflow-y-auto */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 sticky top-0 bg-white pb-2">Resultados</h2> {/* sticky header */}

                        {messages.length > 0 && (
                            <div className={`mb-4 p-3 rounded-md ${messages.some(m => m.includes('Error')) ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
                                }`}>
                                {messages.map((message, index) => (
                                    <p key={index} className="mb-1 last:mb-0 break-words whitespace-pre-wrap">
                                        {message}
                                    </p>
                                ))}
                            </div>
                        )}

                        {results && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.map((result, index) => (
                                            <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {result.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {result.success ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Éxito
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Error
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-xs"> {/* Añadido break-words y max-w-xs */}
                                                    {result.message}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Overlay de carga */}
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;