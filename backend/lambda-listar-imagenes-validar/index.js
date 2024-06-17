const mysql = require('mysql2/promise');

// Función principal de Lambda
exports.handler = async () => {
    // Configurar la conexión a la base de datos MySQL en AWS RDS
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });

    try {
        // Consulta SQL para seleccionar los datos de la tabla
        const [rows] = await connection.execute('SELECT sol_int_id_solicitud,sol_int_id_usuario,sol_txt_estado_aprobacion,sol_txt_url_imagen  FROM ora_solicitudes_aprobacion');
        // Procesar los resultados y generar la respuesta
        const sol_aprob = rows.map(row => ({
            id_sol: row.sol_int_id_solicitud,
            usuario: row.sol_int_id_usuario,
            estado: row.sol_txt_estado_aprobacion,
            url: row.sol_txt_url_imagen,
        }));

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(sol_aprob)
        };
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Error interno del servidor' })
        };
    } finally {
        // Cerrar la conexión a la base de datos
        await connection.end();
    }
};
