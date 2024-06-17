const mysql = require('mysql2/promise');


exports.handler = async (event, context) => {
  // Obtener el id de usuario de la solicitud
  const idUsuario = event.queryStringParameters.idUsuario;
  const { nombreUsuario, contraseña, correoElectronico } = JSON.parse(event.body) || {};

  let nombreUsuarioUpdate = nombreUsuario || null;
  let contraseñaUpdate = contraseña || null;
  let correoElectronicoUpdate = correoElectronico || null;

  // Establecer la conexión con la base de datos
  const connection = await mysql.createConnection({
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
});

  console.log('Conexión establecida');

  try {
    // Verificar si el usuario tiene el rol de cliente
    const [rows] = await connection.execute(`SELECT * FROM ora_usuarios WHERE usr_int_id_usuario =? AND usr_txt_tipo_usuario = 'cliente'`, [idUsuario]);

    if (rows.length === 0) {
      // Si no tiene el rol de cliente, devolver un error 401
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'El usuario no tiene el rol de comprador' })
      };
    }

    // Inicializar un array para almacenar los campos editados
    let camposEditados = [];

    // Iniciar transacción para actualizar los campos
    connection.beginTransaction();

    // Actualizar el nombre de usuario 
    if (nombreUsuarioUpdate!== null) {
      await connection.execute(`UPDATE ora_usuarios SET usr_txt_nombre_usuario =? WHERE usr_int_id_usuario =?`, [nombreUsuarioUpdate, idUsuario]);
      console.log(`Se actualizó el nombre de usuario a ${nombreUsuarioUpdate}`);
      camposEditados.push({ nombreUsuario: nombreUsuarioUpdate });
    }

    // Actualizar la contraseña
    if (contraseñaUpdate!== null) {
      await connection.execute(`UPDATE ora_usuarios SET usr_txt_contrasena =? WHERE usr_int_id_usuario =?`, [contraseñaUpdate, idUsuario]);
      console.log(`Se actualizó la contraseña a ${contraseñaUpdate}`);
      camposEditados.push({ contraseña: contraseñaUpdate });
    }

    // Actualizar el correo electrónico
    if (correoElectronicoUpdate!== null) {
      await connection.execute(`UPDATE ora_usuarios SET usr_txt_correo_electronico =? WHERE usr_int_id_usuario =?`, [correoElectronicoUpdate, idUsuario]);
      console.log(`Se actualizó el correo electrónico a ${correoElectronicoUpdate}`);
      camposEditados.push({ correoElectronico: correoElectronicoUpdate });
    }

    // realizar el commit para guardar los cambios en la BD
    await connection.commit();

    console.log('Se actualizaron los campos:', camposEditados);

    // Devolver un mensaje de éxito con los campos editados
    return {
      statusCode: 200,
      body: JSON.stringify({
        mensaje: 'Se editó el perfil-comprador',
        camposEditados: camposEditados
      })
    };
  } catch (error) {
    // Capturar cualquier error 
    console.error('Error al editar el perfil-comprador:', error);
    connection.rollback(); // Rollback en caso de error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    // Cerrar la conexión con la base de datos
    await connection.end();
    console.log('Conexión cerrada');
  }
};