import { createBrowserRouter } from "react-router-dom";

import Add from "../components/GestionUsuarios/adduser/Add";
import Edit from "../components/GestionUsuarios/updateuser/Edit";
import App from "../App";
import Solicitud from "../components/GestionSolicitudes/getuser/Solicitud";

const route = createBrowserRouter([
    {
      path:"/",
      element: <App/>,

    },
    {
      path:"/add",
      element: <Add/>,
    },
    {
      path:"/edit/:id",
      element: <Edit/> ,
    },
    {
      path:"/Solicitud",
      element: <Solicitud/> ,
    },
  ])

export default route