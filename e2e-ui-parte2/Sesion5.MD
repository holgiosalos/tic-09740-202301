# Sesion 4: Page Object Model con Cypress

## Objetivo
Este ejercicio tiene como objetivo aprender a implementar el patron de diseño "Page Object Model" para pruebas de UI.

## Actividad

### 1. Preparacion

1. Clonar el repositorio "cypress-excercise" usado en la sesion anterior.
2. Es requisito tener solucionado al menos hasta el punto 5 de la [Sesion 4](../e2e-ui-parte1/Sesion4.MD).

### 2. Configurando las pruebas con TypeScript

TypeScript es un lenguaje de programación fuertemente tipado que se basa en JavaScript, lo que resulta util al momento de implementar patrones de diseño como Page Object Model, dado que estan fuertemente ligados al paradimga de Programacion Orientada a Objetos. A continuacion configuraremos nuestro proyecto con typescript: 

1. Instalar las dependencias necesarias para la transpilación de nuestras pruebas escritas en TypeScript a JavaScript por medio de la instalacion de la dependencia de TypeScript.

   ```bash
   npm install --save-dev typescript
   ```

2. Crear el archivo `tsconfig.json` en la raiz del proyecto y copiar dentro de este la siguiente configuración:

   ```json
   {
     "compilerOptions": {
       "target": "es5",
       "skipLibCheck": true,
       "strict": true,
       "lib": ["es5", "dom"],
       "types": ["cypress", "node"]
     },
     "include": ["cypress/**/*.ts", "cypress.config.ts"],
     "exclude": ["node_modules/"]
   }
   ```

3. Cambiar la extensión de nuestra prueba `cypress.config.js` por `cypress.config.ts` y reemplace el codigo existente por este:

   ```js
   import { defineConfig } from "cypress";

   export default defineConfig({
     // setupNodeEvents can be defined in either
     // the e2e or component configuration
     e2e: {
       chromeWebSecurity: false, 
       setupNodeEvents(on, config) {
         // modify config values examples
         // config.defaultCommandTimeout = 10000

         // IMPORTANT return the updated config object
         return config;
       },
     },
   });
   ```

4. Cambiar la extensión de los siguientes archivos de configuracion:

   - `support/commands.js` -> `support/commands.ts`
   - `support/e2e.js` -> `support/e2e.ts`

5. Cambiar la extensión de nuestras pruebas

   - `e2e/google.cy.js` -> `e2e/google.cy.ts`
   - `e2e/saucedemo.login.cy.js` -> `e2e/saucedemo.login.cy.ts`
   - `e2e/saucedemo.cart.cy.js` -> `e2e/saucedemo.cart.cy.ts`

6. Ejecutar el comando de pruebas para comprobar que la transpilación se ejecuta correctamente al correr las pruebas

   ```bash
   npm run test
   ```

6. Cree una nueva rama y envie el Pull Request con estos cambios (incluya una captura de pantalla donde se evidencie que las pruebas estan pasando).No olvide actualizar su rama `main` una vez se haya hecho el proceso de Squash and Merge.

### 3. Configurar Headless mode en cypress

En algunas ocasiones, es importante configurar nuestro comando de pruebas para que ejecute las pruebas en modo "headless", esto es, que ejecute las pruebas sin necesidad de utilizar la inferfaz grafica del navegador, esto ayuda a incrementar la velocidad de ejecucion de las pruebas, asi como, habilita la posibilidad de ejecucion de las pruebas en servidores de integracion continua.

1. Modificar la seccion de scripts en el package.json para ejecutar las pruebas en ambos modos headless (`npm test`) y modo interfaz grafica (`npm run test:open`)

   ```json
   "scripts": {
       "test": "cypress run",
       "test:open": "cypress open"
     },
   ```

### 4. Login Page: Implementacion de Page Object Model 

A continuación realizar la transformación a POM del codigo existente, por medio de los siguientes pasos:

1. Identificaremos los Page Objects necesarios para la pagina de [saucedemo.com](https://www.saucedemo.com/):

   - **Login:** Encapsulara todas las acciones relacionadas al proceso de Login.
   - **Inventory:** Correspondiente a la pagina que lista todos los productos de la tienda, siendo esta pagina, la primera que se muestra luego del Login.
   - **Shopping Cart:** Encapsula la pagina que se muestra una vez das clic en el logo del carrito de compras.

2. Crearemos una carpeta para guardar alli todos los page objects que vamos creando: `/cypress/page/`

3. Para el Login page, crearemos un archivo llamado `/cypress/page/login.page.ts`.

4. Page Object Model establece que las propiedades o atributos de la clase deben corresponder a los locators usados para identificar los elementos con los que interactuamos en la pagina. Teniendo como base la prueba hecha para el login page, los elementos serian: 

   - El input para el username
   - El input para el password
   - El boton de login
   - El div que contiene los mensajes de error

   Creamos entonces inicialmente el Page Object con este contenido:

   ```javascript
   class LoginPage {
       private usernameInput: string;
       private passwordInput: string;
       private loginButton: string;
       private errorMsg: string;

       constructor() {
           this.usernameInput = "#user-name";
           this.passwordInput = "#password";
           this.loginButton = "#login-button";
           this.errorMsg = "[data-test='error']";
       }
   }

   export { LoginPage }
   ```

   **Nota:** Los locators pueden ser inicializados en el constructor o en la misma declaracion del atributo.

5. Una vez identificados los atributos, pasamos a identificar las acciones que podemos realizar en la pagina. Teniendo como base la prueba hecha para el login page, los elementos serian:

   - Ingresar o Hacer el "Login"
   - Cuando el login falla, poder obtener el mensaje de error, para hacer verificaciones.

   Agregamos entonces los metodos a nuestro Login page:

   ```javascript
   class LoginPage {
       private usernameInput: string;
       private passwordInput: string;
       private loginButton: string;
       private errorMsg: string;

       constructor() {
           this.usernameInput = "#user-name";
           this.passwordInput = "#password";
           this.loginButton = "#login-button";
           this.errorMsg = "[data-test='error']";
       }

       public login(email: string, password: string) {
           cy.get(this.usernameInput).type(email);
           cy.get(this.passwordInput).type(password);
           cy.get(this.loginButton).click();
       }

       public getErrorMsg() {
           return cy.get(this.errorMsg);
       }
   }

   export { LoginPage }
   ```

6. Posteriormente crear el archivo `cypress/page/index.ts` para usar como archivo de salida de todos los page object:

   ```javascript
   export { LoginPage } from "./login.page";
   ```

7. Luego modificar el archivo `saucedemo.login.cy.ts` para utilizar el Page Object que acabamos de crear:

   - Primero, importar el page object al inicio del archivo e inicializarlo:
      ```javascript
      import { LoginPage } from "../page/index";

      const loginPage = new LoginPage();
      ```

   - Despues, se modificarian las pruebas existentes, usando el page object, note que se incrementa la legibilidad del codigo:
      ```javascript
          it("Login should notify when a wrong username/password combination is used.", () => {
              loginPage.login("testUser", "testPass");

              // Assertion for error message
              loginPage.getErrorMsg().should(
                "include.text",
                "Username and password do not match any user in this service")
          });

          it("Login should work for existing user.", () => {
            loginPage.login("standard_user", "secret_sauce");

            // Assertion that verifies that products list is displayed
            cy.get(".title").should("have.text", "Products")
          });
      ```

## Tarea

Crear un los siguientes page objects:
   - InventoryPage
   - ShoppingCartPage

Con base en los archivos de prueba: `saucedemo.login.cy.js` y `saucedemo.cart.cy.js`. Posteriormente, actualizar los mismos archivos haciendo uso de los Page Objects creados.

### Rubrica
1. Entregar el repositorio "cypress-excercise" y se encuentra evidencia que se ha seguido GitHub Flow en el desarrollo de los puntos: 20%
2. Configuracion correcta de typescript y el modo headless: 20%
3. Se incluye el codigo hecho en clase para la seccion 4 (Login Page: Implementacion de Page Object Model): 20%
4. Se implementa correctamente POM para los archivos de prueba `saucedemo.login.cy.js` y `saucedemo.cart.cy.js`: 40%

### Bonus Point
1. Realizar las modificaciones necesarias para configurar GitHub actions y lograr que se ejecuten las pruebas por cada Pull Request creado en el repositorio. `[+1.0 en la definitiva de la tarea]`