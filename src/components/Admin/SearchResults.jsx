import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button } from '@mui/material';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results, searchType, searchValue } = location.state || { results: [] };

    const getSearchTypeLabel = (type) => {
        switch (type) {
            case 'name': return 'Nombre y Apellido';
            case 'email': return 'Correo Electrónico';
            case 'employee_id': return 'Employee ID';
            default: return type;
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom>
                Resultados de búsqueda
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Búsqueda por: {getSearchTypeLabel(searchType)} - Valor: {searchValue}
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Apellido</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.nombre}</TableCell>
                                <TableCell>{user.apellido}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.employeeId}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                    >
                                        Ver Detalles
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default SearchResults;