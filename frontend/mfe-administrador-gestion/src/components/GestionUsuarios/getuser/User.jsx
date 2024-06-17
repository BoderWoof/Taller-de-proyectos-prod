import React, { useEffect, useState } from 'react';
import "./user.css";
import { Link } from 'react-router-dom';
import axios from "axios";
import toast from 'react-hot-toast';

const User = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterRole, setFilterRole] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get("https://7af178ezd3.execute-api.us-east-1.amazonaws.com/Prod/Usuarios/Compradores");
            console.log(response.data);
            setUsers(response.data);
            setFilteredUsers(response.data); // Inicialmente mostramos todos los usuarios
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (filterRole) {
            setFilteredUsers(users.filter(user => user.rol === filterRole));
        } else {
            setFilteredUsers(users);
        }
    }, [filterRole, users]);

    const deleteUser = async (userId) => {
        await axios.delete(`https://7af178ezd3.execute-api.us-east-1.amazonaws.com/Prod/Usuarios/EliminarUsuario?${userId}`)
            .then((response) => {
                setUsers((prevUsers) => prevUsers.filter((user) => user.idUsuaruio !== userId));
                toast.success("Usuario Eliminado", { position: 'top-right' });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <div className='userTable'>
            <div className="titulo">
                <h1>Gestión de Usuarios</h1>
            </div>
            <br />
            <div className='btns'>
                <button className='Cliente' onClick={() => setFilterRole('Cliente')}>Cliente</button>
                {"   -   "}
                <button className='Contribuidor' onClick={() => setFilterRole('Contribuidor')}>Contribuidor</button>
                {"   -   "}
                <button className='Todos' onClick={() => setFilterRole('')}>Todos</button>
            </div>
            <br />
            
            <table border={1} cellPadding={10} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>N. Orden</th>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredUsers.map((user, index) => {
                            return (
                                <tr key={user.idUsuario}>
                                    <td>{index + 1}</td>
                                    <td>{user.idUsuario}</td>
                                    <td>{user.nombreUsuario}</td>
                                    <td>{user.correoUsuario}</td>
                                    <td>{user.rolUsuario}</td>
                                    <td className='actionButtons'>
                                        <button onClick={() => deleteUser(user.idUsuario)}>x</button>
                                        <a to={`/edit/${user.idUsuario}`}>Editar</a>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default User;
