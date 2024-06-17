const mysql = require('mysql2');

const handler = async (event) =>  {
    try {
        // Crear una conexión a la base de datos
        const connection = await mysql.createConnection({
            host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
            user: 'admincloud',
            password: 'AdminNube13',
            database: 'production_cloud'
        });

        // Consulta SQL para seleccionar usuarios con el tipo 'Cliente'
        const consulta = "SELECT usr_int_id_usuario AS idUsuario, usr_txt_nombre_usuario AS nombreUsuario, usr_txt_correo_electronico AS correoUsuario, usr_txt_tipo_usuario AS rolUsuario FROM ora_usuarios WHERE usr_txt_tipo_usuario = 'Contribuidor' OR usr_txt_tipo_usuario = 'Cliente'";

        // Ejecutar la consulta SQL
        const resultados = await new Promise((resolve, reject) => {
            connection.query(consulta, function (error, results, fields) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });

        // Cerrar la conexión a la base de datos después de realizar la consulta
        connection.end();

        // Verificar si hay resultados
        if (resultados.length === 0) {
            // Si no hay resultados, devolver un mensaje indicando que no hay clientes en la base de datos
            return {
                statusCode: 204,
                'headers': {
                'Access-Control-Allow-Origin': '*'
            },
                body: JSON.stringify({ message: "No hay clientes en la base de datos" })
            };
        }

        // Crear una lista de usuarios
        const listaUsuarios = resultados.map(usuario => ({
            idUsuario: usuario.idUsuario,
            nombreUsuario: usuario.nombreUsuario,
            correoUsuario: usuario.correoUsuario,
            rolUsuario: usuario.rolUsuario
        }));

        // Crear el objeto de respuesta
        const response = {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(listaUsuarios) // Devolver la lista de usuarios directamente
        };
        return response;
    } catch (error) {
        // Manejar cualquier error que ocurra durante la ejecución
        console.error("Error:", error);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
};


module.exports = { handler };
