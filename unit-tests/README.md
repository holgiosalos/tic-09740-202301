# Sesion 12: Unit Testing

## Objetivo
En este ejercicio, realizaremos pruebas unitarias enfocadas en el front-end y en el back-end:

1. En el caso del Front-end realizaremos el ejercicio con propositos educativos, dado que no es de alta complejidad, no requeriría de pruebas unitarias, puesto que las pruebas de componentes y de contratos proporcionan una buena cobertura en el codigo existente. En este caso, realizaremos las pruebas unitarias unicamente en el Controller.

2. Para el Back-end, realizaremos el ejercicio enfocados en algunas clases, para comprobar ejemplos de pruebas unitarias sociables vs solitarias.

## Pruebas Unitarias en el Front-End

### 1. Preparacion

1. Usaremos tu fork local de cats-shelter-ui.

1. Usaremos el mismo framework de las sesiones anteriores, sino has instalado mocha y chai, por favor instalarlas:
    ```bash
    npm i -D mocha chai
    ```

1. Necesitaremos mockear la libreria de Axios, para este proposito podremos utilizar [moxios](https://github.com/axios/moxios):
    ```bash
    npm i -D moxios
    ```

1. Agregue el siguiente script en el archivo `package.json`:
    ```json
    "test:unit": "mocha test/unit/**/*.test.js",
    ```

1. Publique estos cambios:
    - Cree una rama llamada: moxios-setup
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

### 2. Asegurando la "Testeabilidad" del Codigo

Actualmente, la clase `AnimalController`, no sigue buenas practicas de programacion, ni se ha implementando usando POO. Una prueba de esto, es que la dependencia de `axios` se encuentra instanciada dentro del objeto `AnimalController`, si quisieramos inyectar un mock de dicha de pendencia, no podriamos hacerl, lo cual dificulta la labor de pruebas. A continuacion realizaremos un "workaround" para poder inyectar un mock de axios en las pruebas unitarias:

1. Primero, al inicio del archivo `AnimalController.js`, creamos una instancia de `axios` y la exportamos para que sea accesible desde las pruebas unitarias (ubica el codigo antes de la declaracion del objeto `AnimalController`):

    ```javascript
    export const axiosInstance = axios.create({baseURL: process.env.API});
    ```

1. Despues, reemplaze cada instanciacion de `axios` por un llamado al metodo `request` del objeto `axiosInstance`, como dicha instancia ya tiene configurado el `baseUrl` puedes eliminar dicha propiedad de cada metodo. Al final el objeto `AnimalController` debe quedar asi:

    ```javascript
    export const AnimalController = {

        register(animal) {
            return axiosInstance.request({
                method: 'POST',
                url: 'animals',
                data: animal,
            })
        },
        list() {
            return axiosInstance.request({
                method: 'GET',
                url: 'animals'
            });
        },
        delete(name) {
            return axiosInstance.request({
                method: 'DELETE',
                url: `animals/${name}`,
            });
        },
        getAnimal(name) {
            return axiosInstance.request({
                method: 'GET',
                url: `animals/${name}`,
            });
        },
        updateAnimal(name) {
            return axiosInstance.request({
                method: 'PUT',
                url: `animals/${name}`,
            });
        }
    }
    ```

1. Publique estos cambios:
    - Cree una rama llamada: controller-refactor
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

### 3. Primera Prueba Unitaria

Los cambios de la seccion anterior nos permiten realizar pruebas unitarias sobre el controller. 

1. Primero, crea un directorio llamado `test/unit`

1. Dentro del directorio anterior, crea un archivo llamado `AnimalsController.test.js`

1. Copia y pega el siguiente contenido:

    ```javascript
    import { expect } from 'chai';
    import moxios from 'moxios';
    import { AnimalController, axiosInstance } from '../../controllers/AnimalsController.js';

    describe('Animal Controller Unit Tests', () => {
        
        beforeEach(async () => {
            // inyect mock instance
        });

        afterEach(() => {
            // clear mock instance
        });

        it('Test Register Animal', async () => {
            // Arrange

            // Act

            // Assert
        })
    })
    ```

1. El primer paso, es usar los hooks de beforeEach y afterEach para inyectar y eliminar el mock de axios.

    - Para inyectar el mock, debes usar el comando `moxios.install` especificando la instancia de axios que quieres simular. A continuacion reemplaza el comentario "inyect mock instance" por:

        ```javascript
        moxios.install(axiosInstance);
        ```

    - Para limpiar o eliminar la instancia "mock" inyectada, utilizas el comando `moxios.uninstall` especificando la misma instancia de axios usada en el install. A continuacion reemplaza el comentario "clear mock instance" por:

        ```javascript
        moxios.uninstall(axiosInstance);
        ```

1. Despues, debemos indicarle al mock como responder, cuando se haga un llamado a la instancia de axios. Para esto simularemos la respuesta necesaria cuando se llame al metodo register. Ubica el siguiente codigo en la seccion "Arrange":

    ```javascript
            const animalToRegister = {
                name: "manchas",
                breed: "Bengali",
                gender: "Female",
                vaccinated: true
            }
            
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 201,
                    response: animalToRegister,
                });
            });
    ```

1. Una vez le hemos indicado al mock como responder, ahora haremos el llamado al metodo a probar. Ubica el siguiente codigo en la seccion "Act":

    ```javascript
            const actualResponse = await AnimalController.register(animalToRegister);
    ```

1. Finalmente, realizamos las verificaciones necesarias para asegurarnos que el método register funciona tal cual como se espera. Ubica el siguiente codigo en la seccion "Assert":

    ```javascript
            expect(actualResponse.status).to.be.eql(201);
            expect(actualResponse.data).to.be.eql(animalToRegister);
    ```

### 4. Tarea

1. Implementar las pruebas unitarias para los demás metodos: `list`, `delete`, `getAnimal`, `updateAnimal`.

1. Dichas pruebas deben estar ubicadas en funciones `it` separadas.

## Pruebas Unitarias en el Back-End

Proxima sesión.