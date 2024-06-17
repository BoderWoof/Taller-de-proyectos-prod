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

function validarExistencia(connection, idColeccion, idProducto) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM ora_colecciones WHERE col_int_id_coleccion = ${idColeccion}) AS existColeccion,
                (SELECT COUNT(*) FROM ora_productos WHERE pro_int_id_producto = ${idProducto}) AS existProducto;
        `;
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            if (results[0].existColeccion === 0 || results[0].existProducto === 0) {
                reject(new Error('idColeccion o idProducto no existen en la base de datos'));
            } else {
                resolve();
            }
        });
    });
}

function insertarDetalleColeccion(connection, idColeccion, idProducto) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Id Coleccion " + idColeccion + "  ---- IdProducto  " + idProducto)
            // Primero validar la existencia de idColeccion e idProducto
            await validarExistencia(connection, idColeccion, idProducto);

            const sql = `INSERT INTO ora_detalles_coleccion (det_int_id_coleccion, det_int_id_producto) VALUES (${idColeccion}, ${idProducto})`;
            connection.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
}

// Función principal de Lambda
exports.handler = async (event) => {
    let connection;
    try {
        // Asegurarse de que el cuerpo del evento es un objeto JSON
        const body = JSON.parse(event.body); 
        const { idColeccion, idProducto } = body;
        console.log("Id Coleccion : " + idColeccion + " IdProducto" + idProducto)

        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Insertar el detalle en la base de datos
        const result = await insertarDetalleColeccion(connection, idColeccion, idProducto);

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: 'Detalle de colección insertado correctamente', insertedId: result.insertId })
        };
    } catch (error) {
        console.error('Error al insertar detalle de colección:', error);
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
