// import React from 'react'
// import { RouterProvider } from 'react-router-dom'
// import route from './router'

// export const AppRouter = () => {
//   return (
//     <RouterProvider  router={route}/>
//   )
// }


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Edit from "../components/GestionUsuarios/updateuser/Edit";
import Solicitud from "../components/GestionSolicitudes/getSolicitudes/Solicitud";
import User from "../components/GestionUsuarios/getuser/User";
import Devolucion from "../components/GestionDevoluciones/getDevoluciones/Devolucion";
import { Header } from '../components/GestionUsuarios/header/Header';



const AppRouter = () => {   return (   
  <>

    <Router>
          <Header/>
      <Routes>
        <Route path="/Devolucion" element={<Devolucion />} />         
        <Route path="/Solicitud" element={<Solicitud />} />
        <Route path="/Usuario" element={<User />} />  
        <Route path="/Edit" element={<Edit/>} />  
      </Routes>
    </Router> 
  </>
   
      ); }; 
export default AppRouter;