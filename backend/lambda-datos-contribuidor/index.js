const mysql = require('mysql2');

// Configuración de la conexión a la base de datos MySQL
const connection = await mysql.createConnection({
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
});

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
function consultarInformacionUsuario(connection, usuarioId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT ora_nom_usr, ora_profesion, ora_url, ora_equipo, ora_estilos FROM ora_acerca_de_mi WHERE ora_int_id_usuario = ' + connection.escape(usuarioId);

        connection.query(sql, [usuarioId], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length === 0) {
                reject(new Error('No se encontró información para el usuario proporcionado'));
                return;
            }

            resolve(results);
        });
    });
}

// Función principal de Lambda
exports.handler = async (event) => {
    let connection;
    try {
        // Obtener el ID del usuario de los parámetros de la consulta
        const usuarioId = event.queryStringParameters && event.queryStringParameters.usuarioId ? event.queryStringParameters.usuarioId : null;

        // Verificar si usuarioId es null o undefined
        if (usuarioId === null || usuarioId === undefined) {
            throw new Error('ID de usuario no proporcionado');
        }

        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Consultar información del usuario en la base de datos
        const infoUsuario = await consultarInformacionUsuario(connection, usuarioId);

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: 'Información del usuario encontrada', infoUsuario })
        };
    } catch (error) {
        console.error('Error al consultar información del usuario:', error);
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
