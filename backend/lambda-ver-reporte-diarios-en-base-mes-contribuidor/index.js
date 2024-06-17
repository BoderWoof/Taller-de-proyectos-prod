const AWS = require('aws-sdk');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    // Verificar si el cuerpo de la solicitud está presente y es un JSON válido
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Cuerpo de solicitud no válido.' })
        };
    }

    const { mes, año, usr_int_id_usuario } = JSON.parse(event.body);

    // Validar campos requeridos
    if (!mes || !año || !usr_int_id_usuario) {
        return {
            statusCode: 400,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Faltan campos obligatorios en la solicitud.' })
        };
    }

    // Configurar la fecha inicial y final del mes
    const fechaInicial = `${año}-${mes.toString().padStart(2, '0')}-01`;
    const fechaFinal = new Date(año, mes, 0).toISOString().slice(0, 10); // Último día del mes

    // Configuración de la conexión a MySQL
    const connectionConfig = {
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'

    };

    try {
        const connection = await mysql.createConnection(connectionConfig);

        // Consulta para buscar datos en la tabla ora_ventas y hacer join con ora_productos
        const selectQuery = `
            SELECT 
                DATE(v.ven_val_fecha_venta) AS fecha_venta, 
                v.ven_int_id_producto, 
                p.pro_txt_nombre_producto, 
                p.pro_val_precio_producto
            FROM ora_ventas v
            JOIN ora_productos p ON v.ven_int_id_producto = p.pro_int_id_producto
            WHERE DATE(v.ven_val_fecha_venta) BETWEEN ? AND ?
            AND p.pro_int_id_contribuidor = ?
            ORDER BY DATE(v.ven_val_fecha_venta)`;

        // Ejecutar la consulta con las fechas y el usuario proporcionados
        const [rows] = await connection.execute(selectQuery, [fechaInicial, fechaFinal, usr_int_id_usuario]);

        // Cerrar conexión a MySQL
        await connection.end();

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ ventasPorDía: rows })
        };
    } catch (dbError) {
        console.error('Error en la consulta a la base de datos:', dbError);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Error en la consulta a la base de datos.' })
        };
    }
};
