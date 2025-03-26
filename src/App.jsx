import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Model3D from './components/Model3D';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import ChangePassword from './components/ChangePassword/ChangePassword';
import AdminUsers from './components/Admin/AdminUsers';
import EditUser from './components/Admin/EditUser';
import UserSearch from './components/Admin/UserSearch';
import SearchResults from './components/Admin/SearchResults';
import { useState, useEffect } from 'react';

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    checked: false
  });

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthState({
      isAuthenticated: !!token,
      checked: true
    });
  }, []);

  // Mostrar loading mientras se verifica
  if (!authState.checked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen w-full relative overflow-x-hidden">
        {/* Fondo con opacidad */}
        <img
          src="/images/Fondo_Colmayor.jpg"
          alt="Fondo Colmayor"
          className="fixed inset-0 w-full h-full object-cover opacity-60 -z-10"
        />

        {/* Model3D */}
        <div className="fixed inset-0 -z-1">
          <Model3D />
        </div>

        {/* Contenedor principal */}
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <Routes>
            <Route
              path="/"
              element={
                authState.isAuthenticated ? (
                  <Navigate to="/home" replace />
                ) : (
                  <div className="w-full max-w-md">
                    <Login setAuthState={setAuthState} />
                  </div>
                )
              }
            />
            <Route
              path="/home"
              element={
                authState.isAuthenticated ? (
                  <div className="w-full max-w-6xl h-full overflow-y-auto py-8 px-4">
                    <Home setAuthState={setAuthState} />
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/change-password"
              element={
                authState.isAuthenticated ? (
                  <div className="w-full max-w-md">
                    <ChangePassword />
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Nueva ruta para administración de usuarios */}
            <Route
              path="/admin/users"
              element={
                authState.isAuthenticated ? (
                  <div className="w-full max-w-6xl h-full overflow-y-auto py-8 px-4">
                    <AdminUsers />
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Ruta para edición de usuario */}
            <Route
              path="/admin/users/edit/:userId"
              element={
                authState.isAuthenticated ? (
                  <div className="w-full max-w-6xl h-full overflow-y-auto py-8 px-4">
                    <EditUser />
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Nueva ruta para búsqueda de usuarios */}
            <Route
              path="/admin/users/search"
              element={
                authState.isAuthenticated ? (
                  <div className="w-full max-w-6xl h-full overflow-y-auto py-8 px-4">
                    <UserSearch />
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Ruta para resultados de búsqueda */}
            <Route
              path="/admin/users/search-results"
              element={
                authState.isAuthenticated ? (
                  <div className="w-full max-w-6xl h-full overflow-y-auto py-8 px-4">
                    <SearchResults />
                  </div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;