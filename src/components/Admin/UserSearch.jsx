import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserSearch = () => {
    const [searchType, setSearchType] = useState('name');
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchOptions = [
        { value: 'name', label: 'Nombre y Apellido' },
        { value: 'email', label: 'Correo Electrónico' },
        { value: 'employee_id', label: 'Employee ID' },
    ];

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            setError('Por favor ingrese un término de búsqueda');
            return;
        }

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:8080/api/users/search?type=${searchType}&value=${encodeURIComponent(searchValue)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la búsqueda');
            }

            setResults(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60">
            <div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Buscando usuarios...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
                {/* Encabezado */}
                <div className="bg-emerald-600 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Búsqueda de Usuarios</h1>
                </div>

                {/* Formulario de búsqueda */}
                <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {searchOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder={`Buscar por ${searchOptions.find(o => o.value === searchType)?.label}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <button
                                onClick={handleSearch}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                {/* Resultados */}
                <div className="p-6 overflow-auto" style={{ maxHeight: '60vh' }}>
                    {results.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.apellido}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.employeeId}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {!loading && "Ingrese un término de búsqueda y haga clic en Buscar"}
                        </div>
                    )}
                </div>

                {/* Pie de página */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
                    <Link
                        to="/home"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Volver al Inicio
                    </Link>
                    {results.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">Total encontrados:</span>
                            <span className="font-medium">{results.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearch;