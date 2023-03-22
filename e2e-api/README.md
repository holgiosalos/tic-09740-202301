# Sesion 6: E2E API Tests con Axios

## Objetivo
Este ejercicio tiene como objetivo aprender a configurar y ejecutar pruebas de end to end usando las APIs por medio de [Axios](https://axios-http.com/), [Mocha](https://mochajs.org/) y [Chai](https://www.chaijs.com/).

## Actividad

### 1. Preparacion

1. Instalar la ultima version LTS de Node disponible. v.18.14.x A la fecha (Marzo de 2023)
1. Crear un repositorio llamado "axios-api-testing-excercise" en GitHub. Proporcionar la siguiente descripcion "This is a Workshop about Api Testing in JavaScript". Por ultimo, seleccionar las siguientes opciones de inicializacion:

   - Add a README file
   - Choose MIT License

1. Clone el repositorio creado anteriormente en su computador
1. Crear el archivo **.gitignore** en la raíz del proyecto, luego ingrese a la página <https://www.toptal.com/developers/gitignore> y en el campo de texto digite su sistema operativo (ej: windows, osx, macos) y selecciónelo de la lista de autocompletar. Repita este paso para su entorno de desarrollo (ej:VisualStudioCode, sublime, intellij, jetbrains), también agregue la palabra `node`.
1. Cree una rama, y suba estos cambios al repositorio, cree un Pull Request siguiendo los pasos de GitHub Flow. 
1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.

### 2. Creacion del Proyecto

1. Crear una nueva rama local ejecutando por consola `git checkout -b setup`.
1. Ejecutar en una consola `npm init` dentro de la ruta donde se encuentra el repositorio y colocar la siguiente información:

    | Parametro          | Valor                                              |
    | ------------------ | -------------------------------------------------- |
    | **Name**           | _[Por Defecto]_                                    |
    | **Version**        | _[Por Defecto]_                                    |
    | **Description**    | This is a Workshop about Api Testing in JavaScript |
    | **Entry Point**    | _[Por Defecto]_                                    |
    | **Test Command**   | `mocha`                                            |
    | **Git Repository** | _[Por Defecto]_                                    |
    | **Keywords**       | api-testing, dojo, practice                        |
    | **Author**         | _[Su nombre]_ <_[Su correo]_> (_[su github]_)      |
    | **License**        | MIT                                                |

1. Instalar la dependencia de desarrollo mocha, chai

   ```sh
   npm install --save-dev mocha chai
   ```

1. Crear el archivo `HelloWord.test.js` dentro de una carpeta `test` y utilizar el siguiente codigo como contenido

    ```js
    const { assert } = require('chai');

    describe('Array', () => {
      describe('#indexOf()', () => {
        it('should return -1 when the value is not present', function() {
          assert.equal(-1, [1,2,3].indexOf(4));
        });
      });
    });
    ```

1. Ejecutar el comando `npm test` y comprobar que la prueba pasa de forma satisfactoria
1. Realizar un `commit` donde incluya los archivos agregados y modificados con el mensaje **“setup mocha configuration”**
1. Cree un Pull Request siguiendo los pasos de GitHub Flow. 
1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.

### 3. Primera Prueba de API

En esta sesión, crearemos las primeras pruebas consumiendo de distintas formas servicios API Rest. Utilizaremos una librería cliente llamada **axios** y otra que contiene un enumerador de los principales códigos de respuesta.

1. Crear una nueva rama a partir de main
1. Instalar las dependencia de desarrollo **http-status-codes**

    ```sh
    npm install --save-dev http-status-codes
    ```

1. Instalar la dependencia **axios**. (Tenga en cuenta que esta no es de desarrollo)

    ```sh
    npm install --save axios
    ```

1. Dentro de la carpeta test crear el archivo `MyFirstApiConsume.test.js`

    ```js
    const axios = require('axios');
    const { expect } = require('chai');
    const { StatusCodes } = require('http-status-codes');

    describe('First Api Tests', () => {
    });
    ```

1. Agregar una prueba consumiendo un servicio GET

    ```js
    it('Consume GET Service', async () => {
      const response = await axios.get('https://httpbin.org/ip');

      expect(response.status).to.equal(StatusCodes.OK);
      expect(response.data).to.have.property('origin');
    });
    ```

1. Agregar una prueba consumiendo un servicio GET con Query Parameters

    ```js
    it('Consume GET Service with query parameters', async () => {
      const query = {
        name: 'John',
        age: '31',
        city: 'New York'
      };

      const response = await axios.get('https://httpbin.org/get', { query });

      expect(response.status).to.equal(StatusCodes.OK);
      expect(response.config.query).to.eql(query);
    });
    ```

1. Ejecutar las pruebas.
1. Agregar pruebas consumiendo servicios **POST** y **DELETE**. Utilice <https://httpbin.org/> para encontrar los servicios y la documentación de [axios](https://axios-http.com/docs/intro)
1. Elimine el archivo `test/HelloWord.test.js`
1. Haga commit y push de los cambios
1. Cree un Pull Request siguiendo los pasos de GitHub Flow. 
1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.

### 4. Integración Continua

En esta sesión se configurará la integración continua con Github Actions, adicionalmente se activará dentro de github una validación que sólo permita realizar merge si la integración continua ha pasado. Y por último se configurará mocha para que haga una espera mucho más grande por la ejecución de las pruebas ya que algunos request pueden tomar más de 2 segundos.

1. Ir a la opción Actions del repositorio
1. Buscar el action de Node.js y darle a configurar, esto lo llevará a editar el action
1. Agregar el siguiente contenido

    ```yaml
    name: Node.js CI
    on:
      push:
        branches: [ main ]
      pull_request:
        branches: [ main ]
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v3
        - name: Use Node.js 16.x
          uses: actions/setup-node@v3
          with:
            node-version: 18.x
            cache: 'npm'
        - run: npm ci
        - run: npm run build --if-present
        - name: Run tests
          run: npm test
    ```

1. Modifique el script de **test** del package.json agregando al final `-t 5000`
1. Ir a la configuración del repositorio y cree una regla de proteccion para el branch main activando github actions como requerido:

   - Ir a Settings > Branches
   - Adicionamos una regla dando click en "add branch protection rule".
   - Escribimos main en el campo de branch name pattern.
   - Una vez hecho eso, damos click en la siguiente opcion: "Require status checks to pass before merging".
   - Tambien clic en todas las opciones internas del status check anterior.

1. Cree un Pull Request siguiendo los pasos de GitHub Flow. 
1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.

### 5. Autenticación en pruebas de APIs

En esta sección se realizarán pruebas al API de GitHub, en donde se consultarán datos del repositorio que hemos creado y se implementarán mecanismos para trabajar con la autenticación de ésta API.

1. Crear un token de acceso (classic) en nuestra cuenta de Github seleccionando (repo, gist, users) y darle acceso público a nuestro repositorios. Recuerde que debe copiar el token ya que no volverá a tener acceso a él. [Aqui estan las instrucciones sobre como crear el token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)

1. Dentro de la carpeta test crear el archivo `GitHubApi.Authentication.test.js`

    ```js
    const { StatusCodes } = require('http-status-codes');
    const { expect } = require('chai');
    const axios = require('axios');

    const urlBase = 'https://api.github.com';
    const githubUserName = 'TuUsuarioDeGitHub';
    const repository = 'axios-api-testing-excercise';

    describe('Github Api Test', () => {
      describe('Authentication', () => {
        it('Via OAuth2 Tokens by Header', async () => {
          const response = await axios.get(`${urlBase}/repos/${githubUserName}/${repository}`, {
            headers: {
              Authorization: `token ${process.env.ACCESS_TOKEN}`
            }
          });

          expect(response.status).to.equal(StatusCodes.OK);
          expect(response.data.description).equal('This is a Workshop about Api Testing in JavaScript');
        });
      });
    });
    ```

1. Reemplazar el valor de githubUserName por su usuario de Github.
1. Reemplazar el valor de repository por el nombre del repositorio
1. Establecer la variable de entorno **ACCESS_TOKEN** insertando lo siguiente en la consola con el valor del token de acceso

    ```bash
    export ACCESS_TOKEN=token_de_acceso
    ```
    Este paso es necesario realizarlo cada vez que se inicie el computador. Existen otras opciones para la configuración de variables de entorno como hacerlo a través de un [archivo de configuración](https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html) o usando las [variables de ambiente de Windows](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/set_1). De esta manera, la variable de entorno persistirá y no será necesario volver a configurarla
1. Ejecutar las pruebas.
1. Adicionar la prueba para autenticación por parámetros.

    ```js
    it('Via OAuth2 Tokens by parameter', async () => {
      const response = await axios.get(
        `${urlBase}/repos/${githubUserName}/${repository}`,
        { access_token: process.env.ACCESS_TOKEN }
      );

      expect(response.status).to.equal(StatusCodes.OK);
      expect(response.data.description).equal('This is a Workshop about Api Testing in JavaScript');
    });
    ```

1. Ir a la configuración del repositorio > secrets > actions
1. Agregar la variable **ACCESS_TOKEN** como una variable del repositorio con su respectivo valor
1. Editar el archivo de ejecución del CI **continuous-integration.yml** y agregar la variable en el step de nombre **Run tests**, de tal modo que quede de la siguiente manera:

    ```yml
    - name: Run tests
      env:
        ACCESS_TOKEN: ${{secrets.ACCESS_TOKEN}}
      run: npm test
    ```
1. Subir los cambios a GitHub, crear un PR y solicitar revisión

### 6. Activar Debug en VS Code

Puede elegir una de las siguientes opciones:
1. **Opcion 1:** Para activar el debug con pruebas ejecutadas en mocha:
   - Clic en el item del menu lateral izquierdo llamado "Run and Debug"
   - Clic en la opcion "Create a launch.json"
   - Elejir Node.js
   - Se creara un archivo llamado `launch.json` en el directorio `.vscode`
   - Clic en el boton "Add configuration"
   - Agregar la opcion que dice "Node.js: Mocha Tests"
   - En los argumentos pasados en la propiedad "args" reemplace tdd por bdd.

2. **Opcion 2:** En la raiz del proyecto:
   - Crear una carpeta llamada `.vscode`
   - Dentro de esa carpeta, crear el archivo `launch.json`
   - Copiar y pegar el siguiente contenido

      ```json
      {
          // Use IntelliSense to learn about possible attributes.
          // Hover to view descriptions of existing attributes.
          // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
          "version": "0.2.0",
          "configurations": [
              {
                  "args": [
                      "-u",
                      "bdd",
                      "--timeout",
                      "999999",
                      "--colors",
                      "${workspaceFolder}/test"
                  ],
                  "internalConsoleOptions": "openOnSessionStart",
                  "name": "Mocha Tests",
                  "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
                  "request": "launch",
                  "skipFiles": [
                      "<node_internals>/**"
                  ],
                  "type": "node"
              }
          ]
      }
      ```

3. Después, puede agregar breakpoints en los archivos de prueba que necesite.

## Tarea

Ahora que ya sabemos como realizar peticiones http, incluyendo como hacer autenticaciones con la API de GitHub. Vamos a automatizar un flujo de negocio, en este caso, realizaremos un conjunto de pruebas automaticas que verifiquen el funcionamiento de la [API de Issues de GitHub](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#about-issues).

Crear el archivo `GithubApi.Issue.test.js` y dentro de este, codificar los cambios necesarios para los pasos siguientes:

1. Obtendremos el usuario logueado mediante el consumo del del servicio `https://api.github.com/user` y verificaremos que exista el repositorio "axios-api-testing-excercise". (O como haya llamado su repositorio creado en la seccion 1.1). 
1. A partir del usuario y el nombre del repositorio construimos la url que nos permita crear un issue que contenga solamente un título mediante un método POST la estructura de la url es `https://api.github.com/repos/${username}/${repositoryName}/issues`. Verificamos que el título corresponda y que el cuerpo no contenga contenido.
1. Modifique el issue agregandole un cuerpo mediante un método PATCH usando la url `https://api.github.com/repos/${username}/${repositoryName}/issues/{issueNumber}`. Verifique que el título no haya cambiado y que contenga el nuevo cuerpo (Puede usar un GET  para esta ultima verificacion y usar el codigo de respues del paso anterior para obtener el `issueNumber`).
1. Despues, realice el "lock" del issue, como `lock_reason` utilice el valor "resolved". Verifique con un GET que el lock_reason del issue es "resolved" y que la propiedad "locked" es "true".
1. Por ultimo, elimine el "lock" realizado en el punto anterior. Verifique que la propiedad "locked" ha cambado a "false".
1. Asegurese que todas las pruebas estan pasando satisfactoriamente en el CI.

**Notas:** 
- Para esta tarea usted debera usar los metodos POST, PATCH, PUT y DELETE. segun corresponda.
- El issue creado en el punto 2, debe ser usado para realizar las acciones de los puntos 3, 4 Y 5.

### Rubrica

1. Punto 1: `[0.50]`
1. Punto 2: `[0.50]`
1. Punto 3: `[1.0]`
1. Punto 4: `[1.0]`
1. Punto 5: `[1.0]`
1. Punto 6: `[1.0]`