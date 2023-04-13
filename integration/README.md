# Sesion 9: Integration Tests with Java, Spring Boot and TestContainers

## Objetivo
Este ejercicio tiene como objetivo aprender a implementar pruebas de integracion enfocadas en Bases de Datos usando Java, SpringBoot y [TestContainers](https://www.testcontainers.org/).

En este ejercicio realizaremos pruebas de integracion enfocadas en bases de datos, revisaremos dos posibles alternativas:
   1. Usando una base de datos real.
   2. Usando [TestContainers](https://www.testcontainers.org/)

## Enfoque 1: Usando una BD real

### 1. Preparacion

1. Si aun no ha configurado el backend [cats-shelter-back](https://github.com/holgiosalos/cats-shelter-back), realice los pasos correspondientes a las secciones 1, 2 y 3 de la [sesion anterior](../component-back/README.md).

1. Cree una nueva base de datos llamada: "test-pets". Recuerde los pasos de la [seccion 2](../component-back/README.md#2-preparacion-de-la-bd) de la [sesion anterior](../component-back/README.md).

1. Cree una nueva variable de entorno en el archivo `.env` para especificar el nombre de la base de datos a usar en las pruebas.

   ```env
   TEST_DB=test-pets
   ```

1. A continuacion, agregaremos un archivo de configuracion para que Spring-Boot utilice la base de datos diferente a la de produccion, en las pruebas de integración. Para esto, creamos el archivo `integration-test.yml` en la carpeta `src/test/resources`:

   ```yml
   spring:
     datasource:
       url: jdbc:postgresql://${DB_HOST}/${TEST_DB}
       username: ${DB_USERNAME}
       password: ${DB_PASSWORD}

     sql:
       init:
         mode: never
         platform: postgresql

     jpa:
       database-platform: org.hibernate.dialect.PostgreSQLDialect
       show-sql: true
       hibernate:
         ddl-auto: create-drop
   ```

1. Publique estos cambios:
    - Cree una rama llamada: integration-test-setup
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

### 2. Creando la primera prueba de integracion

1. En la carpeta `src/test/java`, crearemos el siguiente paquete `com.shelter.animalback.integration.db.animal`

1. Posteriormente, crearemos la siguiente clase de java, `AnimalDataBaseTest.java`:

   ```java
   package com.shelter.animalback.integration.db.animal;
   
   import com.shelter.animalback.model.AnimalDao;
   import com.shelter.animalback.repository.AnimalRepository;
   import org.junit.jupiter.api.Test;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.context.SpringBootTest;
   
   import static org.hamcrest.MatcherAssert.assertThat;
   import static org.hamcrest.Matchers.equalTo;
   import static org.hamcrest.Matchers.notNullValue;
   
   @SpringBootTest(
           webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
           properties = { "spring.config.additional-location=classpath:integration-test.yml"})
   public class AnimalDataBaseTest {
   
       @Autowired
       private AnimalRepository animalRepository;
   
       @Test
       public void createAnimal() {
           var animal = new AnimalDao("Hela", "Mestizo", "Female", true);
           var animalDb = animalRepository.save(animal);
   
           assertThat(animalDb, notNullValue());
           assertThat(animalDb.getName(), equalTo("Hela"));
           assertThat(animalDb.getBreed(), equalTo("Mestizo"));
           assertThat(animalDb.getGender(), equalTo("Female"));
           assertThat(animalDb.isVaccinated(), equalTo(true));
       }
   }
   ```

   - Esta clase, utiliza la configuracion creada en la seccion anterior para las pruebas de integracion.
   - Verifica la correcta integracion entre la clase AnimalRepository y la base de datos.

1. Ejecuta la clase de pruebas. Verifique que los tests pasan.

   - Si usas IntelliJ. Edita la configuracion de pruebas para agregar las variables de ambiente. Clic derecho en el boton de "Run Test", y luego seleccionar "Modify run configuration", agregas las variables de entorno.

   - Si usas otro IDE, puedes agregar las variables de entorno y luego ejecutar por consola la clase de prueba:

   ```bash
   $ export $(grep -v '^#' .env | xargs -d '\n')
   $ ./gradlew test --tests "com.shelter.animalback.integration.db.animal.AnimalDataBaseTest"
   ```


1. Publique estos cambios:
    - Cree una rama llamada: integration-test-real-db
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local

## Enfoque 2: Usando TestContainers

[TestContainers](https://www.testcontainers.org/) es una libreria que nos permite usar versiones contenerizadas de bases de datos como PostgreSQL, permitiendonos ejecutar pruebas de integracion con bases de datos reales, pero sin requerir configuraciones previas, o instalaciones locales de servidores de DB.

### 1. Preparacion

1. Primero, agregaremos las dependencias necesarias al archivo `build.gradle`:

   ```groovy
   testImplementation "org.testcontainers:testcontainers:1.18.0"
   testImplementation "org.testcontainers:junit-jupiter:1.18.0"
   testImplementation "org.testcontainers:postgresql:1.18.0"
   ```

1. Como [TestContainers](https://www.testcontainers.org/) se encargará de lanzar el contenedor con la base de datos necesitada en tiempo de ejecucion de las pruebas, no es necesario que definamos una configuracion de base de datos, en su lugar, podemos configurar esto dinamicamente dentro de la clase de pruebas. Para ello seguimos estos pasos: 

   - Modificamos el `integration-test.yml`, reemplazamos el contenido actual por este:

      ```yml
      spring:
        datasource:
          url: none
          username: none
          password: none
      ```

   - Agregamos la anotacion de `@Testcontainers` en la firma de la clase `AnimalDataBaseTest`:

      ```java
      @SpringBootTest(
              webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
              properties = { "spring.config.additional-location=classpath:integration-test.yml"})
      @Testcontainers
      public class AnimalDataBaseTest {
      ```

   **Nota:** Agregar los siguientes imports:

      ```java
      import org.testcontainers.junit.jupiter.Testcontainers;
      ```

   - Instanciamos el contenedor de la DB a usar, agregamos la siguiente linea despues de la firma de la clase:

      ```java
      @Container
      private static PostgreSQLContainer database = new PostgreSQLContainer("postgres:13.2");
      ```

   **Nota:** Agregar los siguientes imports:

      ```java
      import org.testcontainers.containers.PostgreSQLContainer;
      import org.testcontainers.junit.jupiter.Container;
      ```

   - Agregamos un metodo para configurar dinamicamente las propiedades de conexion de Base de datos:

      ```java
          @DynamicPropertySource
          static void databaseProperties(DynamicPropertyRegistry registry) {
              registry.add("spring.datasource.url", database::getJdbcUrl);
              registry.add("spring.datasource.username", database::getUsername);
              registry.add("spring.datasource.password", database::getPassword);
          }
      ```

   **Nota:** Agregar los siguientes imports:

      ```java
      import org.springframework.test.context.DynamicPropertyRegistry;
      import org.springframework.test.context.DynamicPropertySource;
      ```

1. Ejecuta la clase de pruebas. Verifique que los tests pasan.

   - Recuerde parar la ejecucion de docker compose que contiene la base de datos usada inicialmente.
   - Remueva las variables de ambiente de la configuracion de pruebas de IntelliJ.
   - Si no tienes Docker Desktop, y estas en Windows, probablemente tendras problemas para ejecutar las pruebas, en ese caso ejecuta las pruebas dentro de WSL.

1. Publique estos cambios:
    - Cree una rama llamada: test-container-setup
    - Haga commit y push de los cambios
    - Cree un PR, recuerde seleccionar su propio repo y no el fork principal.
    - Haga merge
    - Después, actualice la rama `main` local