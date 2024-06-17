const mysql = require('mysql2');

exports.handler = async (event) => {

    const idusuario = event.queryStringParameters.idusuario;

    // Verificar si idusuario es nulo
    if (idusuario === null || idusuario === "") {
        return {
            statusCode: 400,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: "El valor de idusuario es nulo" })
        };
    }

    // Conexion a la base de datos
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });

    // Consulta para verificar si el usuario existe
    const consultaVerificarUsuario = "SELECT COUNT(*) AS count FROM ora_usuarios WHERE usr_int_id_usuario = " + connection.escape(idusuario);

    try {
        const { count } = await new Promise((resolve, reject) => {
            connection.query(consultaVerificarUsuario, function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (count === 0) {
            return {
                statusCode: 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ message: "El usuario no existe" })
            };
        }

        // Solo ejecutar el DELETE si el valor de idusuario no es nulo
        if (idusuario !== null) {
            // Consulta para eliminar usuario
            const consultaEliminarUsuario = "DELETE FROM ora_usuarios WHERE usr_int_id_usuario = " + connection.escape(idusuario);

            await new Promise((resolve, reject) => {
                connection.query(consultaEliminarUsuario, function (error, results, fields) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }

        const response = {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: "Se eliminó correctamente el usuario" }),
        };
        return response;
    } catch (error) {
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: "Error al ejecutar la consulta en la base de datos" })
        };
    } finally {
        connection.end(); // Cerrar la conexión después de usarla
    }
 
};


 
