// Importar el módulo mysql2 para conectarse a MySQL
const mysql = require('mysql2/promise');

// Función principal de Lambda
exports.handler = async (event, context) => {
  const idUsuario = event.queryStringParameters.idUsuario;

  // Validar que el usuario tenga el rol de cliente
  if (!idUsuario) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parámetro idUsuario es requerido' })
    };
  }

  // Configurar la conexión a la base de datos
  const connection = await mysql.createConnection({
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
});

  try {
    // Consulta SQL para obtener los datos del comprador
    const [rows] = await connection.execute('SELECT u.usr_int_id_usuario, u.usr_txt_nombre_usuario, u.usr_txt_contrasena, u.usr_txt_correo_electronico, du.dtl_enum_tipo_suscripcion FROM ora_usuarios u inner join ora_detalle_usuario du on u.usr_int_id_usuario = du.dtl_int_id_usuario where u.usr_int_id_usuario = ? and u.usr_txt_tipo_usuario = \'cliente\'', [idUsuario]);

    // Validar que el usuario tenga el rol de cliente
    if (rows.length === 0) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'El usuario no tiene el rol de comprador' })
      };
    }

    // Procesar los resultados y generar la respuesta
    const comprador = rows[0];
    return {
      statusCode: 200,
      body: JSON.stringify({
        idUsuario: comprador.usr_int_id_usuario,
        nombreUsuario: comprador.usr_txt_nombre_usuario,
        contrasena: comprador.usr_txt_contrasena,
        correoElectronico: comprador.usr_txt_correo_electronico,
        tipoPlan: comprador.dtl_enum_tipo_suscripcion
      })
    };
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    // Cerrar la conexión a la base de datos
    await connection.end();
  }
};