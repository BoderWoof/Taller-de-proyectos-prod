const mysql = require('mysql2/promise');

const handler = async (event, context) => {

    const idUsuario = event.queryStringParameters.idUsuario;

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
        P.pro_int_id_producto AS idProducto,
        P.pro_txt_nombre_producto AS nombreProducto,
        P.pro_val_precio_producto AS precioProducto,
        P.pro_txt_descripcion_producto AS descripcionProducto,
        P.pro_int_contador_vistas AS contadorVistasProducto,
        P.pro_txt_url_producto AS urlImagenProducto,
        P.pro_int_id_tipo AS idTipoProducto,
        P.pro_txt_formato_producto AS formatoProducto,
        P.pro_txt_resolucion_producto AS resolucionProducto,
        P.pro_int_id_artista AS idContribuidor,
        T.tip_txt_nombre_tipo AS nombreTipo
    FROM 
        temp_carrito_compras C
    JOIN 
        temp_car_detalles_carrito DC ON C.temp_car_int_id_carrito = DC.temp_det_int_id_carrito
    JOIN 
        ora_productos P ON DC.temp_det_int_id_producto = P.pro_int_id_producto
    JOIN 
        ora_tipos_producto T ON P.pro_int_id_tipo = T.tip_int_id_tipo
    WHERE 
        C.temp_car_int_id_usuario = ?;
        `;
        const [productos] = await connection.execute(query,[idUsuario]);

        if (productos.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No hay productos disponibles.' })
            };
        }

        console.log(productos)

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(productos)
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

exports.handler =  handler 