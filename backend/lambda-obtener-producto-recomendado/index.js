const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    // Configuración de conexión a MySQL
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });

    try {
        // Consulta para obtener los 10 productos con más vistas
        const query = `
            SELECT 
                pro_int_id_producto, 
                pro_txt_nombre_producto, 
                pro_txt_descripcion_producto, 
                pro_int_contador_vistas, 
                pro_val_precio_producto, 
                pro_txt_url_producto, 
                pro_int_id_tipo, 
                pro_txt_formato_producto, 
                pro_txt_resolucion_producto, 
                pro_int_id_artista
            FROM 
                ora_productos 
            ORDER BY 
                pro_int_contador_vistas DESC 
            LIMIT 10;
        `;
        const [productos] = await connection.execute(query);

        if (productos.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No hay productos disponibles.' })
            };
        }

        // Seleccionar un producto aleatorio entre los 10 productos más vistos
        const productoRecomendado = productos[Math.floor(Math.random() * productos.length)];

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(productoRecomendado)
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
        if (connection) await connection.end();
    }
};
