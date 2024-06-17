const mysql = require('mysql2');

// Configuración de la conexión a la base de datos MySQL
const connectionConfig = {
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
};

// Función para conectar a la base de datos MySQL
function conectarBaseDeDatos() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(connectionConfig);
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Conexión establecida con la base de datos MySQL');
            resolve(connection);
        });
    });
}

// Función para consultar información de productos por ID de usuario
function consultarProductosPorUsuario(connection, usuarioId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                v.ven_int_id_usuario AS idUsuario,
                p.pro_int_id_producto AS idProducto,
                p.pro_txt_nombre_producto AS nombreProducto,
                p.pro_val_precio_producto AS precioProducto,
                p.pro_txt_descripcion_producto AS descripcionProducto,
                p.pro_int_contador_vistas AS contadorVistasProducto,
                p.pro_txt_url_producto AS urlImagenProducto,
                p.pro_txt_etiqueta_producto_1 AS idTipoProducto,
                p.pro_txt_formato_producto AS formatoProducto,
                p.pro_txt_resolucion_producto AS resolucionProducto,
                p.pro_int_id_artista AS idContribuidor
            FROM
                ora_ventas v
            JOIN
                ora_productos p ON v.ven_int_id_producto = p.pro_int_id_producto
            WHERE
                v.ven_int_id_usuario = 
        ` + connection.escape(usuarioId);

        connection.query(sql, [usuarioId], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length === 0) {
                reject(new Error('No se encontraron productos para el usuario proporcionado'));
                return;
            }

            resolve(results);
        });
    });
}

// Función principal de Lambda
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event)); // Log del evento para inspección
    const usuarioId = event.queryStringParameters && event.queryStringParameters.usuarioId ? parseInt(event.queryStringParameters.usuarioId) : null;
    let connection;
    try {
        // Verificar si usuarioId es null o undefined
        if (usuarioId === null || isNaN(usuarioId)) {
            throw new Error('ID de usuario no proporcionado');
        }

        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Consultar productos del usuario en la base de datos
        const productos = await consultarProductosPorUsuario(connection, usuarioId);

        // Crear una lista de productos
        const listaProductos = productos.map(producto => ({
            idUsuario: producto.idUsuario,
            idProducto: producto.idProducto,
            nombreProducto: producto.nombreProducto,
            precioProducto: producto.precioProducto,
            descripcionProducto: producto.descripcionProducto,
            contadorVistasProducto: producto.contadorVistasProducto,
            urlImagenProducto: producto.urlImagenProducto,
            idTipoProducto: producto.idTipoProducto,
            formatoProducto: producto.formatoProducto,
            resolucionProducto: producto.resolucionProducto,
            idContribuidor: producto.idContribuidor
        }));

        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: 'Productos encontrados', productos: listaProductos })
        };
    } catch (error) {
        console.error('Error al consultar productos:', error);
        return {
            statusCode: 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ mensaje: error.message })
        };
    } finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
            connection.end();
        }
    }
};