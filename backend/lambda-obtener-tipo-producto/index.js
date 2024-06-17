// Importar el módulo mysql2 para conectarse a MySQL
const mysql = require('mysql2/promise');

// Función principal de Lambda
exports.handler = async (event, context) => {
    // Configurar la conexión a la base de datos MySQL en AWS RDS
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });
    
    try {
        // Consulta SQL para seleccionar los datos de los productos, ordenados por contador de vistas
        const [rows] = await connection.execute('SELECT tip_int_id_tipo, tip_txt_nombre_tipo, tip_txt_descripcion_tipo, tip_txt_imagen_tipo FROM ora_tipos_producto');

        // Procesar los resultados y generar la respuesta
        const productos = rows.map(row => ({
            id_producto: row.tip_int_id_tip,
            nombre_tipos: row.tip_txt_nombre_tipo,
            descripcion_producto: row.tip_txt_descripcion_tipo,
            id_categoria: row.tip_txt_imagen_tipo,
        }));

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(productos)
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
