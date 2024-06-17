const mysql = require('mysql2');

// Configuración de la conexión a la base de datos MySQL
const connectionConfig = {
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
};

// Función para conectar a la base de datos MySQL
function conectarBaseDeDatos() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(connectionConfig);
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Conexión establecida con la base de datos MySQL');
            resolve(connection);
        });
    });
}

// Función para consultar información del usuario por ID de usuario
function consultarUsuarioPorId(connection, usuarioId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT usr_int_id_usuario, usr_txt_nombre_usuario, usr_txt_contrasena, usr_txt_correo_electronico, usr_txt_nombre_legal FROM ora_usuarios WHERE usr_int_id_usuario = ' + connection.escape(usuarioId);

        connection.query(sql, [usuarioId], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length === 0) {
                reject(new Error('No se encontró el usuario con el ID proporcionado'));
                return;
            }

            resolve(results);
        });
    });
}

// Función principal de Lambda
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event)); // Log del evento para inspección
    const usuarioId = event.queryStringParameters && event.queryStringParameters.usuarioId ? parseInt(event.queryStringParameters.usuarioId) : null;
    let connection;
    try {
        // Verificar si usuarioId es null o undefined
        if (usuarioId === null || isNaN(usuarioId)) {
            throw new Error('ID de usuario no proporcionado');
        }

        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Consultar información del usuario en la base de datos
        const usuario = await consultarUsuarioPorId(connection, usuarioId);

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: 'Usuario encontrado', usuario: usuario[0] })
        };
    } catch (error) {
        console.error('Error al consultar usuario:', error);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: error.message })
        };
    } finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
            connection.end();
        }
    }
};
