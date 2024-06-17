const mysql = require('mysql2/promise'); // Importar mysql2/promise para usar promesas

const handler = async (event) => {
  // Obtener idUsuario y tipoProducto de los parámetros de la consulta
  const idUsuario = event.queryStringParameters.idUsuario;
  const tipoProducto = event.queryStringParameters.tipoProducto; // 'Imagenes', 'Videos', 'All'

  // Validar que tipoProducto sea uno de los valores permitidos
  if (!["Imagenes", "Videos", "All"].includes(tipoProducto)) {
    const response = {
      statusCode: 400,
      'headers': {
        'Access-Control-Allow-Origin': '*'
    },
      body: JSON.stringify({
        message: `El tipo "${tipoProducto}" no es un tipo valido para la consulta, solo se permiten "Imagenes", "Videos" o "All" que representa a imagenes y videos`
      })
    };
    console.log(response);
    return response;
  }

  // Validar que idUsuario no sea nulo
  if (idUsuario == null) {
    const response = {
      statusCode: 400,
      'headers': {
        'Access-Control-Allow-Origin': '*'
    },
      body: JSON.stringify({
        message: `No se recibio un "idUsuario", este es un parametro obligatorio`
      })
    };
    console.log(response);
    return response;
  }
 
  try {
    // Conexión a la base de datos MySQL usando mysql2/promise
    const connection = await mysql.createConnection({
      host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
      user: 'admincloud',
      password: 'AdminNube13',
      database: 'production_cloud'
  });

    // Inicialización de variables para la consulta SQL y los parámetros
    let consultaSQL;
    let parametrosSQL;
    let respuesta = {
      statusCode: 200,
      'headers': {
        'Access-Control-Allow-Origin': '*'
      },
      body: {
        listaColecciones: [] // Inicializar como un array vacío
      }
    };

    // Construir la consulta SQL según el tipo de producto
    if (tipoProducto !== 'All') {
      // Consulta para 'Imagenes' o 'Videos'
      consultaSQL = `
        SELECT
          c.col_int_id_coleccion AS idColeccion,
          c.col_txt_nombre_coleccion AS nombreColeccion,
          COUNT(dc.det_int_id_producto) AS cantidadProductosTotal,
          c.col_int_id_usuario AS idUsuarioDueñoColeccion,
          MAX(p.pro_txt_url_producto) AS urlProductoAleatorio
        FROM ora_colecciones c
        JOIN ora_detalles_coleccion dc ON c.col_int_id_coleccion = dc.det_int_id_coleccion
        JOIN ora_productos p ON dc.det_int_id_producto = p.pro_int_id_producto
        WHERE c.col_int_id_usuario = ?
          AND p.pro_int_id_tipo = ?
          AND NOT EXISTS (
            SELECT 1
            FROM ora_detalles_coleccion dc2
            JOIN ora_productos p2 ON dc2.det_int_id_producto = p2.pro_int_id_producto
            WHERE dc2.det_int_id_coleccion = c.col_int_id_coleccion
              AND p2.pro_int_id_tipo <> ?
          )
        GROUP BY
          c.col_int_id_coleccion,
          c.col_txt_nombre_coleccion,
          c.col_int_id_usuario;
      `;
      // Determinar el valor de tipoProducto: 1 para 'Imagenes' y 2 para 'Videos'
      const tipoProductoValue = tipoProducto === 'Imagenes' ? 1 : 2;
      parametrosSQL = [idUsuario, tipoProductoValue, tipoProductoValue];
    } else {
      // Consulta para 'All'
      consultaSQL = `
        SELECT
          c.col_int_id_coleccion AS idColeccion,
          c.col_txt_nombre_coleccion AS nombreColeccion,
          COUNT(dc.det_int_id_producto) AS cantidadProductosTotal,
          COUNT(CASE WHEN p.pro_int_id_tipo = 1 THEN 1 ELSE NULL END) AS cantidadProductosTipo1,
          COUNT(CASE WHEN p.pro_int_id_tipo = 2 THEN 1 ELSE NULL END) AS cantidadProductosTipo2,
          c.col_int_id_usuario AS idUsuarioDueñoColeccion,
          MAX(p.pro_txt_url_producto) AS urlProductoAleatorio
        FROM ora_colecciones c
        LEFT JOIN ora_detalles_coleccion dc ON c.col_int_id_coleccion = dc.det_int_id_coleccion
        LEFT JOIN ora_productos p ON dc.det_int_id_producto = p.pro_int_id_producto
        WHERE c.col_int_id_usuario = ?
        GROUP BY
          c.col_int_id_coleccion,
          c.col_txt_nombre_coleccion,
          c.col_int_id_usuario;
      `;
      parametrosSQL = [idUsuario];
    }

    // Ejecutar la consulta SQL usando mysql2/promise
    const [resultados] = await connection.query(consultaSQL, parametrosSQL);

    // Mapear los resultados a la estructura de la respuesta
    resultados.forEach(element => {
      let resultadoConsulta = {
        idColeccion: element.idColeccion,
        nombreColeccion: element.nombreColeccion,
        cantidadProductosTotal: element.cantidadProductosTotal,
        idUsuarioDueñoColeccion: element.idUsuarioDueñoColeccion,
        urlProductoAleatorio: element.urlProductoAleatorio
      };

      // Agregar información adicional para el tipo 'All'
      if (tipoProducto === 'All') {
        resultadoConsulta.cantidadProductosTipo1 = element.cantidadProductosTipo1;
        resultadoConsulta.cantidadProductosTipo2 = element.cantidadProductosTipo2;
      }

      respuesta.body.listaColecciones.push(resultadoConsulta);
    });

    // Cerrar la conexión a la base de datos
    await connection.end();

    // Convertir body a JSON string antes de devolver la respuesta
    respuesta.body = JSON.stringify(respuesta.body);

    console.log(JSON.stringify(respuesta));
    return respuesta;
  } catch (error) {
    console.log('Error : ' + error);
    return {
      statusCode: 500,
      'headers': {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};

module.exports = { handler }; // Exportar el manejador para su uso en otros módulos
