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

// Función para obtener los temas de la base de datos
function obtenerTemas(connection) {
    return new Promise((resolve, reject) => {
        // Consulta SQL para obtener todos los temas
        const sql = `SELECT * FROM ora_temas`;

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

        // Obtener los temas de la base de datos
        const temas = await obtenerTemas(connection);

        return {
            statusCode: 200,
            body: JSON.stringify(temas)
        };
    } catch (error) {
        console.error('Error al obtener temas:', error);
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
