const mysql = require('mysql2/promise');
exports.handler = async (event, context) => {
  // Establecemos la conexión con la base de datos MySQL usando las credenciales proporcionadas.
  const connection = await mysql.createConnection({
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
});

  try {
    // Extraemos los parámetros de la consulta.
    const cadenaBusqueda = event.queryStringParameters.cadenaBusqueda;
    const orden = event.queryStringParameters.orden;
    const pagina = parseInt(event.queryStringParameters.pagina);
    const imagenesPorPagina = parseInt(event.queryStringParameters.imagenesPorPagina);
    const tipoBusqueda = event.queryStringParameters.tipoBusqueda;
    const idUsuario = parseInt(event.queryStringParameters.idUsuario);

    // Comenzamos a construir la consulta SQL.
    let query = `
      SELECT p.pro_int_id_producto, p.pro_txt_nombre_producto, p.pro_txt_descripcion_producto,
      p.pro_txt_etiqueta_producto_1, p.pro_txt_etiqueta_producto_2, p.pro_int_contador_vistas,
      p.pro_val_precio_producto, p.pro_txt_url_producto, p.pro_txt_formato_producto, p.pro_txt_resolucion_producto,
      p.pro_val_fecha_registro, p.pro_int_id_artista,
      u.usr_txt_nombre_usuario, u.usr_txt_apellido_usuario
      FROM ora_productos p
      INNER JOIN ora_usuarios u ON p.pro_int_id_artista = u.usr_int_id_usuario
      INNER JOIN ora_tipos_producto t ON p.pro_int_id_tipo = t.tip_int_id_tipo
      WHERE 1 = 1 `;

    // Agregamos condiciones a la consulta según los parámetros recibidos.
    if (tipoBusqueda) {
      query += ` AND t.tip_txt_nombre_tipo LIKE '%${tipoBusqueda}%' `;
    }

    if (cadenaBusqueda) {
      query += ` AND p.pro_txt_nombre_producto LIKE '%${cadenaBusqueda}%' `;
    }

    if (idUsuario) {
      query += ` AND p.pro_int_id_artista = ${idUsuario} `;
    }

    // Ordenamos los resultados según el criterio especificado en los parámetros.
    if (orden === 'Mejores imagenes') {
      query += ` ORDER BY p.pro_int_contador_vistas ASC `;
    } else if (orden === 'imagenes nuevas') {
      query += ` ORDER BY p.pro_val_fecha_registro ASC `;
    }

    // Limitamos la cantidad de resultados y aplicamos paginación.
    query += ` LIMIT ?, ?`;

    // Calculamos el desplazamiento (offset) para la paginación.
    const offset = (pagina - 1) * imagenesPorPagina;

    // Ejecutamos la consulta con los parámetros de paginación.
    const [rows] = await connection.execute(connection.format(query, [offset, imagenesPorPagina]));

    // Mapeamos los resultados de la consulta a un formato más manejable.
    const productos = rows.map(row => ({
      id_producto: row.pro_int_id_producto,
      nombre_producto: row.pro_txt_nombre_producto,
      descripcion_producto: row.pro_txt_descripcion_producto,
      etiqueta_producto_1: row.pro_txt_etiqueta_producto_1,
      etiqueta_producto_2: row.pro_txt_etiqueta_producto_2,
      contador_vistas: row.pro_int_contador_vistas,
      precio_producto: row.pro_val_precio_producto,
      url_producto: row.pro_txt_url_producto,
      formato_producto: row.pro_txt_formato_producto,
      resolucion_producto: row.pro_txt_resolucion_producto,
      fecha_registro: row.pro_val_fecha_registro,
      id_artista: row.pro_int_id_artista,
      nombre_usuario: row.usr_txt_nombre_usuario,
      apellido_usuario: row.usr_txt_apellido_usuario
    }));

    // Devolvemos la respuesta con los productos en formato JSON.
    return {
      statusCode: 200,
      'headers': {
        'Access-Control-Allow-Origin': '*'
    },
      body: JSON.stringify(productos)
    };
  } catch (error) {
    // En caso de error, registramos el error y devolvemos una respuesta de error.
    console.error('Error al ejecutar la consulta:', error);
    return {
      statusCode: 500,
      'headers': {
        'Access-Control-Allow-Origin': '*'
    },
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    // Cerramos la conexión a la base de datos.
    await connection.end();
  }
};
