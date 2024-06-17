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
        // Consulta de cantidad de ventas por artista
        const query = `
            SELECT
                pro.pro_int_id_artista AS idArtista,
                usr.usr_txt_nombre_usuario AS nombreArtista,
                COUNT(*) AS ventasTotalesArtista
            FROM
                ora_ventas ven
            INNER JOIN
                ora_productos pro ON ven.ven_int_id_producto = pro.pro_int_id_producto
            INNER JOIN
                ora_usuarios usr ON pro.pro_int_id_artista = usr.usr_int_id_usuario
            GROUP BY
                pro.pro_int_id_artista
            ORDER BY
                ventasTotalesArtista DESC;
        `;
        const [rows] = await connection.execute(query);

        // Formateo del resultado
        const listadoArtistas = rows.map(row => ({
            idArtista: row.idArtista,
            nombreArtista: row.nombreArtista,
            ventasTotalesArtista: row.ventasTotalesArtista
        }));

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ listadoArtistas })
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