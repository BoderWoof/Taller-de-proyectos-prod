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

// Función para actualizar un usuario por su ID
function actualizarUsuario(connection, id, nombre, apellido, correo, rol) {
    return new Promise((resolve, reject) => {
        // Consulta SQL para actualizar el usuario
        const sql = `UPDATE ora_usuarios SET usr_txt_nombre_usuario='${nombre}', usr_txt_apellido_usuario='${apellido}', usr_txt_correo_electronico='${correo}', usr_txt_tipo_usuario='${rol}' WHERE usr_int_id_usuario=${id} `;

        // Parámetros para la consulta SQL
        const values = [nombre, apellido, correo, rol, id];

        // Ejecutar la consulta SQL
        connection.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            if (result.affectedRows === 0) {
                reject(new Error('Usuario no encontrado'));
                return;
            }

            resolve();
        });
    });
}

// Función principal de Lambda
exports.handler = async (event) => {
    let connection;
    try {
        // Obtener el ID del usuario de los parámetros de la consulta
        const idusuario = event.queryStringParameters && event.queryStringParameters.idusuario ? event.queryStringParameters.idusuario : null;

        // Verificar si idusuario es null o undefined
        if (idusuario === null || idusuario === undefined) {
            throw new Error('ID de usuario no proporcionado');
        }

        // Parsear el evento JSON para obtener los datos a actualizar
        const { id, nombre, apellido, correo, rol } = event.body;

        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Actualizar el usuario en la base de datos
        await actualizarUsuario(connection, idusuario, nombre, apellido, correo, rol);

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: 'Usuario actualizado correctamente' })
        };
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
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
