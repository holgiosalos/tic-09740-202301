# Sesion 11: Contract Testing - Provider Side

## Objetivo
Este ejercicio tiene como objetivo aprender a configurar y ejecutar pruebas de Contrato, del lado del Proveedor por medio de [pact](https://pact.io/) y Java con Spring Boot.

## Actividad

### 1. Preparacion

1. Es necesario haber publicado el contrato generado por el consumer side. Ver [sesion anterior.](../contract-consumer/README.md)

1. Si aun no ha configurado el backend [cats-shelter-back](https://github.com/holgiosalos/cats-shelter-back), realice los pasos correspondientes a las secciones 1, 2 y 3 de la [sesion 9](../component-back/README.md).

### 2. Configuración

1. El primer paso es agregar la dependencia de Pact para Spring, para ello, modificaremos el archivo `build.gradle` agregando la siguiente línea:

    ```groovy
    testImplementation 'au.com.dius.pact.provider:junit5spring:4.5.6'
    ```

1. Actualiza dependencias:

   - Si estas usando IntelliJ actualiza dependencias presionando el boton "Load Gradle Change" (tambien lo puedes hacer presionando Ctrl/Cmd + Shift + O).
   - Si estas usando Visual Studio Code ejecuta `./gradlew compileJava compileTestJava`

1. Configura en el archivo `.env` las variables de ambiente para el token y la URL asignados a tu cuenta de Pactflow.

   - Ir a Settings > API Tokens
   - Clic en boton "Copy Env Vars" en el token de escritura y lectura (`Read/Write token`)
   - Pegar en el archivo `.env`
   - Eliminar las comillas de los valores agregados

1. Publique estos cambios:
    - Cree una rama llamada: pact-setup
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

### 3. Definicion Prueba de Contrato

1. Dentro del paquete `com.shelter.animalback` de la carpeta `test/java`, Creas el siguiente paquete: `contract.api.animal`

1. Dentro de este paquete `com.shelter.animalback.contract.api.animal`, creamos el siguiente archivo: `AnimalTest.java`

1. El primer paso es configurar la clase de prueba para que levante Pact junto con el contexto de spring. Para esto, creamos la clase con el siguiente contenido:

    ```java
    package com.shelter.animalback.contract.api.animal;

    import au.com.dius.pact.provider.junit5.PactVerificationContext;
    import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
    import au.com.dius.pact.provider.junitsupport.Provider;
    import au.com.dius.pact.provider.junitsupport.loader.PactBroker;
    import au.com.dius.pact.provider.junitsupport.loader.PactBrokerAuth;
    import org.junit.jupiter.api.TestTemplate;
    import org.junit.jupiter.api.extension.ExtendWith;

    @Provider("CatShelterBack")
    @PactBroker(
            url = "${PACT_BROKER_BASE_URL}",
            authentication = @PactBrokerAuth(token = "${PACT_BROKER_TOKEN}") )
    public class AnimalTest {

        // Declare controller and mocks

        // Inject controller in context

        @TestTemplate
        @ExtendWith(PactVerificationInvocationContextProvider.class)
        void pactVerificationTestTemplate(PactVerificationContext context) {
            context.verifyInteraction();
        }

        // Define the state
    }
    ```

1. El siguiente paso es Inyectar el Controller involucrado en las pruebas, así como los Mocks a utilizar durante las pruebas.

    - Agregamos la siguiente anotacion a la clase:

        ```java
        @ExtendWith(MockitoExtension.class)
        ```

    - Definimos el controller y mocks a utilizar, reemplazando el comentario "Declare controller and mocks" por las siguientes dos lineas. 

        ```java
            @Mock
            private AnimalService animalService;

            @InjectMocks
            private AnimalController animalController;
        ```

    - Inyectamos el Controller en el contexto de Pact y Spring, reemplazando el comentario "Inject controller in context" por las siguientes lineas:

        ```java
            @BeforeEach
            public void changeContext(PactVerificationContext context) {
                MockMvcTestTarget testTarget = new MockMvcTestTarget();
                testTarget.setControllers(animalController);
                context.setTarget(testTarget);
            }
        ```

    - Los imports a agregar por las clases y anotaciones utilizadas en este paso son: 

        ```java
        import au.com.dius.pact.provider.spring.junit5.MockMvcTestTarget;
        import com.shelter.animalback.controller.AnimalController;
        import com.shelter.animalback.service.interfaces.AnimalService;
        import org.junit.jupiter.api.BeforeEach;
        import org.mockito.InjectMocks;
        import org.mockito.Mock;
        import org.mockito.junit.jupiter.MockitoExtension;
        ```
1. Para finalizar, nos encargamos de configurar el estado necesario para ejecutar la prueba de contrato del lado del proveedor

    - Reemplazamos el comentario "Define the state" por las siguientes lineas:

        ```java
            @State("has animals")
            public void listAnimals() {
                Animal animal = new Animal();
                animal.setName("Bigotes");
                animal.setBreed("Siames");
                animal.setGender("Male");
                animal.setVaccinated(false);
                List<Animal> animals = new ArrayList<Animal>();
                animals.add(animal);
                Mockito.when(animalService.getAll()).thenReturn(animals);
            }
        ```

    - Los imports a agregar por las clases y anotaciones utilizadas en este paso son: 

        ```java
        import au.com.dius.pact.provider.junitsupport.State;
        import com.shelter.animalback.domain.Animal;
        import org.mockito.Mockito;
        import java.util.ArrayList;
        import java.util.List;
        ```

1. Verificamos que nuestra prueba se ejecuta exitosamente.

    - Si usas IntelliJ. Edita la configuracion de pruebas para agregar las variables de ambiente. Clic derecho en el boton de "Run Test", y luego seleccionar "Modify run configuration", agregas las variables de entorno. (recuerde los valores de las variables de ambiente deben ir sin comillas)

    - Si usas otro IDE, puedes agregar las variables de entorno y luego ejecutar por consola la clase de prueba:

        ```bash
        $ export $(grep -v '^#' .env | xargs -d '\n')
        $ ./gradlew test --tests "com.shelter.animalback.contract.api.animal.AnimalTest"
        ```
   
   - Note que los datos que responde el provider no son exactamente iguales a los establecidos por el consumer, pero si cumplen con el contrato, por lo que las pruebas se ejecutan exitosamente

1. Publique estos cambios:
    - Cree una rama llamada: provider-contract-test
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

### 3. Publicacion del Contrato

1. Agregar la siguiente línea de código al método changeContext

    ```java
    System.setProperty("pact.verifier.publishResults", "true");
    ```

1. Ejecute nuevamente la clase AnimalTest

1. Verifique en su Pactflow que el contrato ahora esta verificado.

1. Publique estos cambios:
    - Cree una rama llamada: publish-contract
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

