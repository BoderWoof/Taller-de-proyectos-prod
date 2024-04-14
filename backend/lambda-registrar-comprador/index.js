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

    let { nombre, apellido, correo, contrasena } = JSON.parse(event.body);

    // Validar campos requeridos
    if (!nombre || !apellido || !correo || !contrasena) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Faltan campos obligatorios en la solicitud.' })
        };
    }

    const nombreCompleto = `${nombre} ${apellido}`;

    // Configuración de Cognito
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const userPoolId = 'us-east-1_yEMhAlbc4';
    const groupName = 'comprador-intipachaartes';
    const clientId = '1i6e60046ghcsj1l3j8fqal9gm';
    const clientSecret = 'd0c07fu1jd830ekrts6lqd8fd3dns07mlbqjbcnbqcjjk5fnld0';

    // Calcula el hash secreto
    const message = correo + clientId;
    const hmac = crypto.createHmac('sha256', clientSecret);
    hmac.update(message);
    const secretHash = hmac.digest('base64');

    try {
        const connection = await mysql.createConnection({
            host: 'rds-development-db.chu4imeus62g.us-east-1.rds.amazonaws.com',
            user: 'admindev',
            password: 'passworddev',
            database: 'db_cloud'
        });
    
        // Guardar datos en MySQL
        const insertQuery = `INSERT INTO ora_usuarios (usr_txt_nombre_usuario, usr_txt_correo_electronico, usr_txt_contrasena, usr_txt_tipo_usuario, usr_val_fecha_registro, usr_txt_apellido_usuario) VALUES (?, ?, ?, ?, ?, ?)`;
        const rolValue = 'Cliente'; // Valor ENUM válido
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
        await connection.execute(insertQuery, [nombre, correo, contrasena, rolValue, currentDate, apellido]);
    
        // Cerrar conexión a MySQL
        await connection.end();
    } catch (dbError) {
        console.error('Error en la inserción de la base de datos:', dbError);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error en la inserción de la base de datos.' })
        };
    }

    try {
        // Registro de usuario en Cognito
        const signUpParams = {
            ClientId: clientId,
            Username: correo,
            Password: contrasena,
            SecretHash: secretHash,
            UserAttributes: [
                { Name: 'email', Value: correo }
            ]
        };
        await cognito.signUp(signUpParams).promise(); // Ignorar el resultado
    
        // Añadir usuario al grupo en Cognito
        const addUserToGroupParams = {
            UserPoolId: userPoolId,
            Username: correo,
            GroupName: groupName
        };
        await cognito.adminAddUserToGroup(addUserToGroupParams).promise(); // Ignorar el resultado
    
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Usuario registrado y añadido al grupo exitosamente.' })
        };
    } catch (cognitoError) {
        console.error('Error en el registro de usuario en Cognito:', cognitoError);
        return {
            statusCode: 200, // O puedes devolver un código de éxito si lo deseas
            body: JSON.stringify({ message: 'Usuario registrado correctamente.' })
        };
    }
};