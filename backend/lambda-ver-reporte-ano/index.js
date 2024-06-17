const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    let yearsAgo = 3; // Por defecto, mostrar los últimos 3 años
    if (event.queryStringParameters && event.queryStringParameters.years) {
        yearsAgo = parseInt(event.queryStringParameters.years);
    }
    
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsAgo + 1;
    
    // Configuración de conexión a MySQL
    const connection = await mysql.createConnection({
        host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
        user: 'admincloud',
        password: 'AdminNube13',
        database: 'production_cloud'
    });

    try {
        // Consulta de ventas por año con nombres de comprador y producto
        const query = `
            SELECT 
                YEAR(ven_val_fecha_venta) AS year,
                COUNT(*) AS total_ventas,
                GROUP_CONCAT(ven_int_id_producto) AS productos_vendidos,
                GROUP_CONCAT(ven_txt_nombre_comprador) AS nombres_compradores,
                GROUP_CONCAT(ven_txt_nombre_producto) AS nombres_productos
            FROM 
                ora_ventas
            WHERE 
                YEAR(ven_val_fecha_venta) >= ?
            GROUP BY 
                YEAR(ven_val_fecha_venta)
            ORDER BY 
                year DESC;
        `;
        const [rows] = await connection.execute(query, [startYear]);

        // Formateo del resultado
        const formattedResult = {};
        rows.forEach(row => {
            const year = row.year;
            const totalVentas = row.total_ventas;
            const productsIds = row.productos_vendidos.split(',').map(Number);
            const buyersNames = row.nombres_compradores.split(',');
            const productsNames = row.nombres_productos.split(',');
            
            // Construye el objeto para el año actual
            const yearData = [];
            for (let i = 0; i < productsIds.length; i++) {
                yearData.push({
                    id_producto: productsIds[i],
                    nombre_comprador: buyersNames[i],
                    nombre_producto: productsNames[i]
                });
            }
            formattedResult[year] = {
                total_ventas: totalVentas,
                ventas: yearData
            };
        });

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(formattedResult)
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
