const mysql = require('mysql2/promise');

const handler = async (event) => {
  const cadenaBusqueda = event.queryStringParameters.cadenaBusqueda || '';
  const pagina = event.queryStringParameters.pagina || 0;
  const resultadosPorPagina = 80;
  const inicio = (pagina - 1) * resultadosPorPagina;

  try {
    const connection = await mysql.createConnection({
      host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
      user: 'admincloud',
      password: 'AdminNube13',
      database: 'production_cloud'
  });

    const consulta = `SELECT P.pro_int_id_producto AS idProducto, 
                             P.pro_txt_nombre_producto AS nombre_producto, 
                             P.pro_txt_descripcion_producto AS descripcion_producto, 
                             P.pro_int_contador_vistas AS contador_vistas, 
                             P.pro_val_precio_producto AS precio_producto, 
                             P.pro_txt_url_producto AS url_img_producto, 
                             P.pro_int_id_artista AS id_artista
                      FROM ora_productos P 
                      INNER JOIN ora_usuarios A ON P.pro_int_id_artista = A.usr_int_id_usuario 
                      WHERE P.pro_txt_nombre_producto LIKE '%${cadenaBusqueda}%' 
                      LIMIT ${pagina}, ${resultadosPorPagina}`;

    const [results] = await connection.query(consulta);
    await connection.end();
    
    const formattedResult = {
      idProducto: results.idProducto,
      nombre_producto: results.nombre_producto,
      descripcion_producto: results.descripcion_producto,
      contador_vistas: results.contador_vistas,
      precio_producto: results.precio_producto,
      url_img_producto: results.url_img_producto,
      id_artista: results.id_artista
};

    return {
      statusCode: 200,
      body: JSON.stringify(results),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: "Error interno del servidor: " + error }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};

module.exports={handler};