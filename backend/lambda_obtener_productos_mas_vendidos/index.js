const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    // Parsear el JSON del evento para obtener el idContribuidor
    const idContribuidor = event.queryStringParameters.idContribuidor;

    // Verificar si el idContribuidor está presente en el cuerpo del evento
    if (!idContribuidor) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El campo 'idContribuidor' es requerido." })
        };
    }

    let connection;
    try {
        // Conectar a la base de datos MySQL
        connection = await mysql.createConnection({
            host: 'rds-production.cfqss0488m50.us-east-1.rds.amazonaws.com',
            user: 'admincloud',
            password: 'AdminNube13',
            database: 'production_cloud'
        });

        // Consultar el tipo de usuario basado en el idContribuidor
        const [userRows] = await connection.execute(
            'SELECT usr_txt_tipo_usuario FROM ora_usuarios WHERE usr_int_id_usuario = ?',
            [idContribuidor]
        );

        // Log para depuración: mostrar los resultados de la consulta de usuarios
        console.log('userRows:', userRows);

        // Verificar si se encontró el usuario
        if (userRows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Usuario no encontrado." })
            };
        }

        // Obtener el tipo de usuario y convertirlo a minúsculas para una comparación insensible a mayúsculas/minúsculas
        const userType = userRows[0].usr_txt_tipo_usuario.toLowerCase();
        console.log('userType:', userType);

        // Verificar si el usuario es un contribuidor
        if (userType !== 'contribuidor') {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "El usuario no es un contribuidor." })
            };
        }

        // Obtener los productos más vendidos
        const [salesRows] = await connection.execute(
            `SELECT ven_int_id_producto, COUNT(*) as ventas 
             FROM ora_ventas 
             GROUP BY ven_int_id_producto 
             ORDER BY ventas DESC`
        );

        // Log para depuración: mostrar los resultados de la consulta de ventas
        console.log('salesRows:', salesRows);

        // Verificar si hay ventas
        if (salesRows.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ productos: [] })
            };
        }

        // Obtener los IDs de los productos más vendidos
        const productIds = salesRows.map(row => row.ven_int_id_producto);

        // Consultar los nombres de los productos basados en los IDs obtenidos
        const [productRows] = await connection.query(
            `SELECT pro_int_id_producto, pro_txt_nombre_producto 
             FROM ora_productos 
             WHERE pro_int_id_producto IN (?)`,
            [productIds]
        );

        // Crear un mapa de productos para un acceso rápido
        const productsMap = productRows.reduce((acc, product) => {
            acc[product.pro_int_id_producto] = product.pro_txt_nombre_producto;
            return acc;
        }, {});

        // Construir la respuesta con los productos ordenados por la cantidad de ventas
        const productos = salesRows.map(row => ({
            idProducto: row.ven_int_id_producto,
            nombreProducto: productsMap[row.ven_int_id_producto],
            ventas: row.ventas
        }));

        // Devolver la lista de productos más vendidos
        return {
            statusCode: 200,
            body: JSON.stringify({ productos })
        };
    } catch (error) {
        // Log para depuración: mostrar el error de conexión a la base de datos
        console.error('Error connecting to the database:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno del servidor.' })
        };
    } finally {
        // Cerrar la conexión a la base de datos
        if (connection) {
            await connection.end();
        }
    }
};
