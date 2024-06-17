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
        connection.connect(err => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Conexión establecida con la base de datos MySQL');
            resolve(connection);
        });
    });
}

// Validación de usuario existente
function validarUsuario(connection, idUsuario) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) AS count FROM ora_usuarios WHERE usr_int_id_usuario = ${idUsuario}`;
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results[0].count > 0);
        });
    });
}

// Función para insertar una colección
function insertarColeccion(connection, idUsuario, nombreColeccion) {
    return new Promise((resolve, reject) => {
        if (!idUsuario || !nombreColeccion) {
            reject(new Error("El ID de usuario y el nombre de la colección no pueden estar vacíos."));
            return;
        }
        const sql = `INSERT INTO ora_colecciones (col_int_id_usuario, col_txt_nombre_coleccion, col_val_fecha_registro) VALUES (${idUsuario}, '${nombreColeccion}', CURDATE())`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

// Función principal de Lambda
exports.handler = async (event) => {
    let connection;
    try {
        // Asegurarse de que el cuerpo del evento es un objeto JSON
        const body = JSON.parse(event.body);
        console.log(body);
        const { idUsuario, nombreColeccion } = body;

        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Validar que el usuario exista
        const isValidUser = await validarUsuario(connection, idUsuario);
        if (!isValidUser) {
            throw new Error("El ID de usuario no existe en la base de datos.");
        }

        // Insertar la colección en la base de datos
        const result = await insertarColeccion(connection, idUsuario, nombreColeccion);

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: 'Colección insertada correctamente', insertedId: result.insertId })
        };
    } catch (error) {
        console.error('Error al insertar colección:', error);
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
