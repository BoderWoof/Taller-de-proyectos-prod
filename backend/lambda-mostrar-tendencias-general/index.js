// Importar el módulo mysql2 para conectarse a MySQL
const mysql = require('mysql2/promise');

// Función principal de Lambda
exports.handler = async (event, context) => {
  // Configurar la conexión a la base de datos MySQL en AWS RDS
  const connection = await mysql.createConnection({
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
});

  try {
    // Obtener los parámetros de la solicitud
    const page = parseInt(event.queryStringParameters.page); 
    const imagesPerPage = parseInt(event.queryStringParameters.imagesPerPage); 
    const tipoTendencia = event.queryStringParameters.tipoTendencia;
    console.log(typeof(tipoTendencia))
    // Calcular el offset para la consulta SQL

    let query = 'SELECT pro_int_id_producto, pro_txt_nombre_producto, pro_txt_descripcion_producto, pro_int_id_tipo, pro_int_id_artista, pro_txt_url_producto FROM ora_productos WHERE pro_int_contador_vistas > 0 ';
    const queryParams = [];

    if (tipoTendencia !== null && tipoTendencia !== undefined) {
      query += 'AND pro_int_id_tipo = ? ';
      queryParams.push(tipoTendencia);
    }

    // Ejecutar la consulta SQL
    const offset = (page - 1) * imagesPerPage;
    const offsetInt = parseInt(offset.toString(), 10);
    const imagesPerPageInt = parseInt(imagesPerPage.toString(), 10);

    query += 'ORDER BY pro_int_contador_vistas DESC LIMIT ?, ?';
    queryParams.push(offsetInt, imagesPerPageInt);
    console.log(query)

    const [rows] = await connection.execute(connection.format(query, queryParams));

    // Procesar los resultados y generar la respuesta
    const productos = rows.map(row => ({
      id_producto: row.pro_int_id_producto,
      nombre_producto: row.pro_txt_nombre_producto,
      descripcion_producto: row.pro_txt_descripcion_producto,
      id_categoria: row.pro_int_id_tipo,
      id_artista: row.pro_int_id_artista,
      url_producto: row.pro_txt_url_producto
    }));

    return {
      statusCode: 200,
      'headers': {
        'Access-Control-Allow-Origin': '*'
    },
      body: JSON.stringify(productos)
    };
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    return {
      statusCode: 500,
      'headers': {
        'Access-Control-Allow-Origin': '*'
    },
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    // Cerrar la conexión a la base de datos
    await connection.end();
  }
};
