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

// Función para obtener los datos de la tabla ora_tipos_profesion
function obtenerTiposProfesion(connection) {
    return new Promise((resolve, reject) => {
        // Consulta SQL para seleccionar todos los registros de la tabla ora_tipos_profesion
        const sql = 'SELECT * FROM ora_tipos_profesion';

        // Ejecutar la consulta SQL
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
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
        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Obtener los tipos de profesión
        const resultados = await obtenerTiposProfesion(connection);

        return {
            statusCode: 200,
            body: JSON.stringify({ datos: resultados })
        };
    } catch (error) {
        console.error('Error al obtener tipos de profesión:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ mensaje: error.message })
        };
    } finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
            connection.end();
        }
    }
};
//hola