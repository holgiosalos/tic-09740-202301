# Sesion 10: Contract Testing - Consumer Side

## Objetivo
Este ejercicio tiene como objetivo aprender a configurar y ejecutar pruebas de Contrato, del lado del Consumidor por medio de [pact](https://pact.io/).

## Actividad

### 1. Preparacion

1. Si aun no ha configurado el frontend [cats-shelter-ui](https://github.com/holgiosalos/cats-shelter-ui), realice los pasos 1, 2 y 3 correspondientes a la [seccion 3](../component-ui/README.md#3-verificar-funcionamiento-del-front-end) de la [Sesión 7: Component UI Testing](../component-ui/README.md)

1. Asegurate de tener instaladas las dependencias y de haber construido el codigo:

   ```bash
   npm clean install
   npm build
   ```

### 2. Configuracion Pact

1. Cree una nueva rama. Sugerencia: pact-setup

1. En la raiz del front-end, Ejecutar el siguiente comando:

   ```bash
   npm i -D @pact-foundation/pact mocha chai
   ```

1. Creas la carpeta `test/contract`

1. Para no depender de crear variables de ambientes para los tests, vamos a instalar [dotenv](https://www.npmjs.com/package/dotenv) para precargar las variables en la ejecución de los tests.

   ```bash
   npm i dotenv
   ```

1. Luego, configuramos el comando para ejecutar las pruebas de contrato, agregando la siguiente linea al conjunto de `scripts` dentro del archivo `package.json`:

   ```json
   "test:contract": "mocha test/contract/**/*.test.js -r dotenv/config",
   ```

1. Para no tener problemas con los imports en forma de modulos en las pruebas, agregamos la siguiente propiendad dentro del archivo `package.json` antes de la propiedad `name`:

   ```json
   "type": "module",
   ```

1. Con esto, ya estamos listos para configurar el "Mock Provider".

   - Creamos la carpeta `test/contract/config`

   - Y luego, creamos dentro de esa carpeta, el archivo `init-pact.js`:

      ```js
      import { Pact } from '@pact-foundation/pact';
      import path from 'path';
      
      const consumerName = 'CatShelterFront';
      const providerName = 'CatShelterBack';
      
      export const provider = new Pact({
          consumer: consumerName,
          provider: providerName,
          port: 8080,
          cors: true,
          log: path.resolve(process.cwd(), './test/contract/logs', `${consumerName}-${providerName}.log`),
          dir: path.resolve(process.cwd(), './test/contract/pacts')
      });
      ```

1. Si aun no lo has configurado, crea el archivo `.env` en la raiz del proyecto, y agrega la siguiente variable de ambiente que usaremos para especificar la URL del "Mock Provider":

   ```env
   API=http://localhost:8080
   ```

   - **Nota:** Si tienes problemas en la ejecucion de los tests cambia el valor de la variable API por `http://127.0.0.1:8080`

1. Hacer commit de los cambios, Crear un pull request (PR), y realizar el merge.

1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.

### 2. Definicion Pruebas de Contrato

1. Cree una nueva rama. Sugerencia: first-contract-test

1. Pasamos a definir el primer contrato. Para esto creamos la carpeta `test/contract/specs`, donde serán ubicadas todas las pruebas de contrato.

1. Dentro de esta carpeta, creamos el siguiente archivo: `list-animals.contract.test.js`

1. Estableceremos el esqueleto de la prueba e importaremos el provider configurado en la sección pasada. Agregamos el siguiente contenido al archivo creado en el paso anterior:

   ```js
   import { provider } from '../config/init-pact.js';
   
   describe('Animal Service', () => {
       describe('When a request to list all animals is made', () => {
           before(async () => {
               await provider.setup();
               // here we will add the contract
           });
   
           after(() => provider.finalize());
           
           it('should return the correct data', async () => {
               // here will be added the expects
           });
       });
   });
   ```

1. El paso siguiente es definir el contrato, lo haremos a través del provider, utilizando una interacción, que es la manera en que le especificamos a Pact de qué manera el consumidor va a interactuar con el Proveedor.

   - Importamos los matchers de Pact (se agrega en la seccion de imports):

      ```js
      import {Matchers} from '@pact-foundation/pact';
      ```

   - Reemplazamos el comentario dentro del `before` hook por el siguiente codigo.

      ```js
                  await provider.addInteraction({
                      uponReceiving: 'a request to list all animals',
                      state: "has animals",
                      withRequest: {
                          method: 'GET',
                          path: '/animals'
                      },
                      willRespondWith: {
                          status: 200,
                          body: Matchers.eachLike({
                              name: Matchers.like('manchas'),
                              breed: Matchers.like("Bengali"),
                              gender: Matchers.like("Female"),
                              vaccinated: Matchers.boolean(true)
                          })
                      }
                  });
      ```

1. Por último, realizaremos el llamado al endpoint que acabamos de configurar, y verificamos la respuesta proveida por el Mock Provider.

   - Primero importamos el controller de nuestro Frontend y los assertions de `chai`
      ```js
      import { AnimalController } from '../../../controllers/AnimalsController.js';
      import { expect } from 'chai';
      ```

   - Luego, reemplazamos el comentario dentro de la función de test (it) por el siguiente codigo:

      ```js
                  const response = await AnimalController.list();
                  const responseBody = response.data;

                  // Verifying response is an array with one element
                  expect(responseBody).to.not.be.undefined;
                  expect(responseBody).to.be.an('array');
                  expect(responseBody).to.have.lengthOf(1);

                  // Verifyin data within response array
                  var cat = responseBody[0]
                  expect(cat.name).to.be.equal('manchas');
                  expect(cat.breed).to.be.equal('Bengali');
                  expect(cat.gender).to.be.equal('Female');
                  expect(cat.vaccinated).to.be.true;

                  await provider.verify()
      ```

1. Hacer commit de los cambios, Crear un pull request (PR), y realizar el merge.

1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.

### 3. Publicacion del Contrato en el broker

El ultimo paso de las pruebas de contrato del lado del consumidor es, publicar en el broker, los contratos establecidos en cada prueba. En este caso, para efectos prácticos, utilizaremos la capa gratuita de [pactflow.io](https://pactflow.io/).

1. Cree una nueva rama. Sugerencia: publish-contract

1. Accede a tu cuenta de pacflow.io (https://tu-usuario.pactflow.io/) 

1. Configura en el archivo `.env` como variable de ambiente el token y la URL asignados a tu cuenta de Pactflow.

   - Ir a Settings > API Tokens
   - Clic en boton "Copy Env Vars" en el token de escritura y lectura (`Read/Write token`)
   - Pegar en el archivo `.env`

1. Crea un archivo con nombre `publish.js` con el siguiente contenido, dentro de la carpeta `contract/config`:

   ```js
   import { Publisher } from '@pact-foundation/pact';
   import dotenv from 'dotenv';

   dotenv.config();

   const opts = {
      pactBroker: process.env.PACT_BROKER_BASE_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      consumerVersion: process.env.npm_package_version,
      pactFilesOrDirs: ['./test/contract/pacts']
   };

   new Publisher(opts).publishPacts();
   ```

1. Configuramos el comando para publicar las pruebas de contrato, agregando la siguiente linea al conjunto de `scripts` dentro del archivo `package.json`:

   ```json
   "publish:contract": "node ./test/contract/config/publish.js",
   ```

1. Verificamos que el contrato se publique en nuestra cuenta de [pactflow.io](https://pactflow.io/). Ejecutamos el comando:

   ```bash
   npm run publish:contract
   ```

1. Hacer commit de los cambios, Crear un pull request (PR), y realizar el merge.

1. Despues de fusionar los cambios, recuerde hacer `checkout` a la rama main y despues hacer `pull`.