import React, { useEffect, useState } from 'react'
import "./edit.css"
import {Link, useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import toast from 'react-hot-toast';

const Edit = () =>{


    const users = {
        fname: "",
        lname: "",
        email: "",
        // rol: "",
    }

    const {id} = useParams();
    const navigate = useNavigate();
    const[user, setUser] = useState(users);

    const inputChangeHandler = (e) =>{
        const {name, value} = e.target;
        setUser({...user, [name]:value});
        console.log(user);
    }

    useEffect(()=>{
        axios.get(`https://7af178ezd3.execute-api.us-east-1.amazonaws.com/Prod/Usuarios/EditarUsuarios?${idUsuario}`)
        .then((response)=>{
            setUser(response.data)
        })
        .catch((error)=>{
            console.log(error);
        })
    },[id])


    const submitForm = async(e)=>{
        e.preventDefault();
        await axios.put(`http://localhost:8000/api/update/${id}`, user)
        .then((response)=>{
            toast.success("Datos Modificados", {position:"top-right"})
            navigate("/Usuario")
        })
        .catch(error => console.log(error))
    }

  return (
    <div className='updateUser'>
        <Link to={"/Usuario"}>Volver</Link>
        <h3>Modificar Datos del Usuario</h3>
        <form className='updateUserForm' onSubmit={submitForm}>
            <div className='inputGroup'>
                <label htmlFor="fname">Nombre</label>
                <input type="text" value={user.fname} onChange={inputChangeHandler} id="fname" name="fname" autoComplete='off' placeholder='First Name' />
            </div>
            <div className='inputGroup'>
                <label htmlFor="lname">Apellido</label>
                <input type="text" value={user.lname} onChange={inputChangeHandler} id="lname" name="lname" autoComplete='off' placeholder='Last Name' />
            </div>
            <div className='inputGroup'>
                <label htmlFor="email">Email</label>
                <input type="email" value={user.email} onChange={inputChangeHandler} id="email" name="email" autoComplete='off' placeholder='Email' />
            </div>
            <div className='inputGroup'>
                <label htmlFor="rol">Rol</label>
                <input type="rol" value={user.rol} onChange={inputChangeHandler} id="rol" name="rol" autoComplete='off' placeholder='Rol' />
            </div>

            <div className='inputGroup'>
                <button type="submit">Guardar Cambios</button>
            </div>
        </form>
    </div>
  )
}

export default Edit