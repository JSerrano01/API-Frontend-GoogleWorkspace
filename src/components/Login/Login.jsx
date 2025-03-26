import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';
import Input from '../Input/Input';
import Button from '../Button/Button';

const Login = ({ setAuthState }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Limpieza inicial al cargar
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setAuthState({ isAuthenticated: false, checked: true });
    }, [setAuthState]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.user_id);
                setAuthState({ isAuthenticated: true, checked: true });
                navigate('/home', { replace: true });
            } else {
                setError(data.message || 'Credenciales incorrectas');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
            console.error('Error en login:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full p-8 rounded-lg bg-white bg-opacity-60 shadow-lg">
            <Card className="text-center shadow-none" bgColor="bg-transparent">
                <div className="login-header">
                    <img
                        src="/images/Escudo_Colmayor.png"
                        alt="Logo Colmayor"
                        className="w-24 mx-auto mb-4"
                    />
                    <h1 className="text-xl font-bold mb-2">Bienvenido</h1>
                    <h2 className="text-gray-600 mb-6">Sistema Administración Google Workspace</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                    />
                    <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                    />
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="remember"
                            className="mr-2"
                        />
                        <label htmlFor="remember" className="text-sm text-gray-600">
                            Recordarme
                        </label>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </span>
                        ) : 'Iniciar Sesión'}
                    </Button>
                </form>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                    </div>
                )}
                <div className="mt-4 text-center">
                    <a
                        href="/forgot-password"
                        className="text-[#005652] hover:underline text-sm"
                    >
                        Olvidé mi contraseña
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default Login;