const AWS = require('aws-sdk');
const crypto = require('crypto');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    const { username, password } = JSON.parse(event.body);


    // Configuración de Cognito
    const clientId = '5dk7dini4mq7lv66ftieijacf5';
    const clientSecret = 'hc4v7isdksa0nmg3o7rqe6ms8c8dkspdbhllftfrbgkphf0p9i';

    // Calcula el hash secreto
    const message = username + clientId;
    const hmac = crypto.createHmac('sha256', clientSecret);
    hmac.update(message);
    const secretHash = hmac.digest('base64');

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            'USERNAME': username,
            'PASSWORD': password,
            'SECRET_HASH': secretHash // Incluye el hash secreto en los parámetros de autenticación
        }
    };

    try {
        const data = await cognitoIdentityServiceProvider.initiateAuth(params).promise();
        
        // Si el inicio de sesión es exitoso, devolver el token de acceso
        return {
            statusCode: 200,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ accessToken: data.AuthenticationResult.AccessToken,idToken: data.AuthenticationResult.IdToken })
        };
    } catch (error) {
        // Manejar errores de inicio de sesión
        console.log("Error al iniciar sesión:", error);
        return {
            statusCode: 401,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Credenciales inválidas' })
        };
    }
};
