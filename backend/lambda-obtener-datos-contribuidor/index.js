const mysql = require('mysql'); // Importa el módulo mysql para interactuar con una base de datos MySQL.
const util = require('util'); // Importa el módulo util para usar promisify y convertir funciones callback-based a promises.

// Crea un pool de conexiones a la base de datos con las credenciales y parámetros especificados.
const pool = mysql.createPool({
  host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
  user: 'admincloud',
  password: 'AdminNube13',
  database: 'production_cloud'
});

// Convierte pool.query a una función basada en promesas para usar async/await.
const query = util.promisify(pool.query).bind(pool);

// Función handler principal que se ejecuta cuando se invoca la función Lambda.
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2)); // Loguea el evento recibido para depuración.

  // Obtiene y convierte los parámetros de la solicitud.
  const idUsuario = parseInt(event.queryStringParameters.idUsuario);
  //const rolUsuario = event.queryStringParameters.rolUsuario;

  // Verifica si los parámetros son válidos. Si no, retorna un error 400..
  if (!idUsuario) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid parameters' })
    };
  }

  try {
    // Consulta SQL para obtener los detalles del usuario y sus relaciones con otras tablas.
    const userQuery = `
       SELECT usr.usr_txt_correo_electronico as email, 
             usr.usr_int_id_usuario as idUsuario, 
             usr.usr_txt_nickname as nombreUsuario, 
             usr.usr_txt_contrasena as contrasena, 
             usr.usr_txt_nombre_legal as nombreUsuarioAPagar, 
             dtl.dtl_txt_direccion_postal as direccionPostal, 
             dtl.txt_direccion_complementaria as lineaDireccion, 
             dtl.dtl_txt_ciudad as ciudad, 
             dtl.dtl_int_codigo_postal as codigoPostal, 
             dtl.dtl_txt_pais as país, 
             dtl.dtl_provincia as provincial, 
             dtl.dtl_txt_correo_pago as correoPago, 
             dtl.dtl_dec_pago_minimo as pagoMinimo, 
             dtl.dtl_url_sitio_web as sitioWeb, 
             dtl.dtl_frase_cierre as fraseCierre, 
             adm.ora_profesion as tipoColaborador, 
             adm.ora_estilos as estilos, 
             adm.ora_temas as temas, 
             adm.ora_equipo as equipo, 
             red.dtlR_txt_facebook as redFacebook, 
             red.dtlR_txt_instagram as redInstagram, 
             red.dtlR_txt_linkedin as redLinkedin, 
             red.dtl_txt_twitter as redTwitter
      FROM ora_usuarios usr
      LEFT JOIN ora_detalle_usuario dtl ON usr.usr_int_id_usuario = dtl.dtl_int_id_usuario
      LEFT JOIN ora_detalle_red_usuario red ON usr.usr_int_id_usuario = red.dtlR_id_usuario
      LEFT JOIN ora_acerca_de_mi adm ON usr.usr_int_id_usuario = adm.ora_int_id_usuario
      WHERE usr.usr_int_id_usuario = ? AND usr.usr_txt_tipo_usuario = 'Contribuidor';
    `;

    // Ejecuta la consulta con el idUsuario proporcionado.
    const results = await query(userQuery, [idUsuario]);
    console.log('Query results:', results); // Loguea los resultados de la consulta para depuración.

    // Si no se encuentra ningún resultado, retorna un error 404.
    if (results.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Contributor not found' })
      };
    }

    // Si se encuentra el usuario, retorna los detalles del mismo.
    return {
      statusCode: 200,
      body: JSON.stringify(results[0])
    };
  } catch (error) {
    // Si ocurre un error durante la consulta, loguea el error y retorna un error 500.
    console.error('Database query error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};
