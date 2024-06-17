const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos MySQL
const connectionConfig = {
    host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
    user: 'admincloud',
    password: 'AdminNube13',
    database: 'production_cloud'
};

// Función para conectar a la base de datos MySQL
async function conectarBaseDeDatos() {
    try {
        const connection = await mysql.createConnection(connectionConfig);
        console.log('Conexión establecida con la base de datos MySQL');
        return connection;
    } catch (err) {
        throw new Error('Error al conectar a la base de datos: ' + err.message);
    }
}

// Función para consultar información de archivos por ID de producto
async function consultarArchivosPorProducto(connection, idProducto) {
    const sql = `
        SELECT
            dtl_int_id_archivo AS idArchivo,
            dtl_txt_url_archivo AS urlArchivo,
            dtl_datetime_fecha_subida AS fechaSubida,
            dtl_txt_tipo_imagen AS tipoImagen
        FROM
            ora_detalle_archivo
        WHERE
            dtl_txt_tipo_imagen = 'prueba'
            AND dtl_int_id_producto =`+ connection.escape(idProducto);

    try {
        const [results] = await connection.execute(sql, [idProducto]);

        if (results.length === 0) {
            throw new Error('No se encontraron archivos para el producto proporcionado');
        }

        return results;
    } catch (err) {
        throw new Error('Error al consultar archivos: ' + err.message);
    }
}

// Función principal de Lambda
exports.handler = async (event) => {
    console.log('Event:', event.queryStringParameters); // Log del evento para inspección
    let connection;

    if (!event.queryStringParameters.idProducto) {
        return {
            statusCode: 400,
            body: JSON.stringify({ mensaje: 'El ID del producto es requerido' })
        };
    }

    const idProducto = event.queryStringParameters.idProducto;

    try {
        // Conectar a la base de datos
        connection = await conectarBaseDeDatos();

        // Consultar archivos del producto en la base de datos
        const archivos = await consultarArchivosPorProducto(connection, idProducto);

        // Crear una lista de archivos
        const listaArchivos = archivos.map(archivo => ({
            idArchivo: archivo.idArchivo,
            urlArchivo: archivo.urlArchivo,
            fechaSubida: archivo.fechaSubida,
            tipoImagen: archivo.tipoImagen
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ mensaje: 'Archivos encontrados', archivos: listaArchivos })
        };
    } catch (error) {
        console.error('Error al consultar archivos:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ mensaje: error.message })
        };
    } finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
            await connection.end();
        }
    }
};

