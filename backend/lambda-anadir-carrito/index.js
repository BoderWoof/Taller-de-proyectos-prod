const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    // Extracción de los datos del evento recibido
    const { idUsuario, listaProductos } = JSON.parse(event.body);

    // Configuración de conexión a MySQL
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });

    try {
        // Obtener el carrito de compras del usuario
        const [carritos] = await connection.execute(
            'SELECT temp_car_int_id_carrito FROM temp_carrito_compras WHERE temp_car_int_id_usuario = ?', 
            [idUsuario]
        );

        let idCarrito;
        if (carritos.length === 0) {
            // Si no existe un carrito, crear uno nuevo
            const now = new Date();
            const [result] = await connection.execute(
                'INSERT INTO temp_carrito_compras (temp_car_int_id_usuario, temp_car_val_fecha_creacion) VALUES (?, ?)',
                [idUsuario, now]
            );
            idCarrito = result.insertId;
        } else {
            // Si existe un carrito, usar el existente
            idCarrito = carritos[0].temp_car_int_id_carrito;
        }

        // Insertar los productos en el carrito
        for (let producto of listaProductos) {
            await connection.execute(
                'INSERT INTO temp_car_detalles_carrito (temp_det_int_id_carrito, temp_det_int_id_producto) VALUES (?, ?)',
                [idCarrito, producto.idProducto]
            );
        }

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Productos añadidos al carrito exitosamente.' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Error al procesar la solicitud.' })
        };
    } finally {
        if (connection) await connection.end();
    }
};