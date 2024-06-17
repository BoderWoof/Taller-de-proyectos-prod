const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    // ID del usuario recibido desde el frontend
    //const idUsuario = event.idUsuario;

    // Configuración de conexión a MySQL
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });

    try {
        // Obtener fecha actual
        const now = new Date();

        // Consulta para obtener los carritos abandonados
        const query = `
            SELECT
                temp_car_int_id_carrito AS idCarrito,
                temp_car_val_fecha_creacion AS fechaCreacion,
                COUNT(temp_det_int_id_detalle_carrito) AS cantidadProductos
            FROM
                temp_carrito_compras tcc
            LEFT JOIN
                temp_car_detalles_carrito tcdc ON tcc.temp_car_int_id_carrito = tcdc.temp_det_int_id_carrito
            WHERE
                temp_car_val_fecha_creacion < ? 
            GROUP BY
                tcc.temp_car_int_id_carrito;
        `;
        //const [rows] = await connection.execute(query, [idUsuario, now]);
        const [rows] = await connection.execute(query, [now]);
        
        // Formatear la respuesta
        const carritosAbandonados = rows.map(row => ({
            idCarrito: row.idCarrito,
            fechaCreacion: row.fechaCreacion,
            cantidadProductos: row.cantidadProductos
        }));

        // Contar la cantidad total de carritos abandonados
        const cantidadCarritosAbandonados = carritosAbandonados.length;

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({cantidadCarritosAbandonados, carritosAbandonados })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Error al consultar la base de datos.' })
        };
    } finally {
        // Cierra la conexión a MySQL al finalizar
        if (connection) await connection.end();
    }
};
