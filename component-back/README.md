# Sesion 8: Backend Component Testing with Java and Spring Boot

## Objetivo
Este ejercicio tiene como objetivo aprender a implementar pruebas de componentes enfocadas en el Backend.

## Actividad

### 1. Requisitos

Dado que las pruebas de componentes tienen un enfoque shift-left se hace necesario conocer el codigo de la aplicacion sujeta a pruebas. Es por ello, que para esta actividad, utilizaremos un back-end distinto al de la sesion pasada, el cual utilizara una base de datos postgreSQL y un backend implementado en Java y Spring Boot.

1. Dados los requisitos del Backend, se hace necesario una base de datos local. Para esto tiene dos opciones:
   - El repositorio del backend proporciona un docker-compose con las instrucciones necesarias para instalar un par de contenedores con postgreSQL y pgAdmin. Por ende, debe tener instalado Docker, bien sea usando Docker Desktop o Docker Engine.
   - Instalar localmente postgreSQL y pgAdmin.

1. Realice un fork del nuevo back-end de la aplicación: [cats-shelter-back](https://github.com/holgiosalos/cats-shelter-back)
2. Si aun no lo tiene, Realice un fork del front-end de la aplicación: [cats-shelter-ui](https://github.com/holgiosalos/cats-shelter-ui)

### 2. Preparacion de la BD

1. Clone su fork personal del back-end de la aplicacion: "cats-shelter-backend"
1. Iniciar los servicios de Docker Engine o su aplicacion de Docker for Desktop. Si tiene instalada una version local de postgreSQL, salte al paso 7. 
1. Abra una terminal/consola y ejecute el siguiente comando ubicado en la carpeta raiz del proyecto "cats-shelter-backend":
   ```bash
   docker compose -f compose.yml up
   ```
1. Espere a que docker instale e inicialice los contenedores de postgreSQL y pgAdmin. 
1. Ingrese a la aplicacion de pgAdmin.
   - Si ha usado docker, la contraseña y usuario estan en el compose.yml
1. Agregue el servidor de postgreSQL
   - Clic derecho en Servers y luego seleccione Register > Server..
   - En la pestaña General:
      - Name: Docker postgreSQL
   - En la pestaña Connections:
      - Host: teste-postgres-compose
      - Port: 5432
      - Username: postgres
      - Password: ver compose.yml
1. Cree una base de datos llamada pets

### 3. Verificar funcionamiento del Back-end

1. Configurar variables de ambiente del archivo .env:
   - ver instrucciones del profe si estas usando IntelliJ.
   - Desde un git bash, ejecutar desde la raiz del proyecto:

      ```bash
      export $(grep -v '^#' .env | xargs -d '\n')
      ```

1. Para poner en ejecucion la API (desde git bash):

   ```bash
   ./gradlew bootRun
   ```

4. Verifique que el back-end esta ejecutandose bien accediendo al siguiente link: [http://localhost:8080/animals](http://localhost:8080/animals)

   Debera salir json con la mascota llamada: "Bigotes!"

### 4. Verificar funcionamiento del Front-end (opcional)

1. Clone su fork personal del front-end de la aplicacion: "cats-shelter-ui"
2. En la carpeta raiz, cree un archivo llamado `.env`, con la informacion de la API:

   ```env
   API_URL=http://localhost:8080
   ```

3. Ejecute el siguiente comando, para instalar las dependencias necesarias:

    ```bash
    npm install
    ```

4. Para poner la ejecucion la aplicación, ejecute:

   ```
   npm run dev
   ```

5. Verifique que el front-end esta ejecutandose bien accediendo al siguiente link: [http://localhost:3000/](http://localhost:3000/)

   Debera abrirse una pagina con dos opciones:

   - Register Animal
   - List Animal

### 5. Configurar el proyecto para ejecutar pruebas de componentes


1. El primer paso, es configurar las dependencias de pruebas. Para ello, dado que utilizamos spring-boot y lombok, agregamos las siguentes dependencias:

   ```groovy
   testCompileOnly 'org.projectlombok:lombok:1.18.22'
   testAnnotationProcessor 'org.projectlombok:lombok:1.18.22'
   testImplementation 'org.springframework.boot:spring-boot-starter-test'
   testImplementation 'org.junit.jupiter:junit-jupiter-api:5.9.2'
   ```

1. Dado que uno de los requisitos de las pruebas de componentes es aislar la aplicacion bajo prueba de dependencias externas, en este caso, reemplazaremos BD de postgres por una base de datos en memoria:

   - Agregamos la dependencia de H2, que es una BD en memoria:

      ```groovy
      testImplementation 'com.h2database:h2:2.1.214'
      ```

   - Posteriormente, debemos agregar un archivo de configuracion de spring-boot para que use H2 en lugar de Postgres. Dado que este archivo se utilizará exclusivamente para pruebas de componentes, lo nombraremos `component-test.yml` y debera ser ubicado en el directorio `src/test/resources`, con el siguiente contenido:

      ```yml
      spring:
        datasource:
          url: jdbc:h2:mem:pets;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
          username: sa
          password:
          driverClassName: org.h2.Driver

        sql:
          init:
            mode: never
            platform: h2
        
        jpa:
          database-platform: org.hibernate.dialect.H2Dialect
          hibernate:
            ddl-auto: create-drop
      ```

### 6. Creando la primera prueba de componentes

En esta primera prueba nos enfocaremos en la api de GET /animals. El objetivo sera:
- Configurar datos antes de ejecutar las pruebas sobre la API
- Verificar que la API efectivamente retorna los datos almacenados en la BD en memoria
- Verificar la estructura del JSON retornado por la API.

1. En la carpeta `src/test/java`, crearemos el siguiente paquete `com.shelter.animalback.component.api.animal`

1. Posteriormente, crearemos la siguiente clase de java, `ListAnimalsTest.java`:

   ```java
   package com.shelter.animalback.component.api.animal;

   import com.shelter.animalback.model.AnimalDao;
   import com.shelter.animalback.repository.AnimalRepository;
   import lombok.SneakyThrows;
   import org.junit.jupiter.api.BeforeEach;
   import org.junit.jupiter.api.Test;
   import org.junit.jupiter.api.extension.ExtendWith;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
   import org.springframework.boot.test.context.SpringBootTest;
   import org.springframework.http.HttpStatus;
   import org.springframework.http.MediaType;
   import org.springframework.test.annotation.DirtiesContext;
   import org.springframework.test.context.junit.jupiter.SpringExtension;
   import org.springframework.test.web.servlet.MockMvc;

   import static org.hamcrest.MatcherAssert.assertThat;
   import static org.hamcrest.Matchers.equalTo;
   import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

   @ExtendWith(SpringExtension.class)
   @SpringBootTest(
         webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
         properties = { "spring.config.additional-location=classpath:component-test.yml"})
   @DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
   @AutoConfigureMockMvc
   public class ListAnimalsTest {
      @Autowired
      private MockMvc mockMvc;

      @Autowired
      private AnimalRepository animalRepository;

      @BeforeEach
      public void setUp() {
         var cat = new AnimalDao("Thor", "Birmano", "Male", false);
         animalRepository.save(cat);
      }

      @Test
      @SneakyThrows
      public void listAnimalsSuccessfully() {
         var response = mockMvc.perform(get("/animals")).andReturn().getResponse();

         assertThat(response.getStatus(), equalTo(HttpStatus.OK.value()));
         assertThat(response.getContentType(), equalTo(MediaType.APPLICATION_JSON.toString()));
      }
   }
   ```

1. Ahora agregaremos una verificacion del response, comprobando el schema que retorna:

   - Primero agregamos la dependencia que nos ayudara con la verificacion del schema:

      ```groovy
      testImplementation 'org.everit.json:org.everit.json.schema:1.0.0'
      ```

   - Despues agregamos el siguiente metodo a la clase `ListAnimalsTest.java`:

      ```java
      @Test
      @SneakyThrows
      public void listAnimalsWithRightSchema() {
          var response = mockMvc.perform(get("/animals")).andReturn().getResponse();
   
          var jsonSchema = new JSONObject(new JSONTokener(ListAnimalsTest.class.getResourceAsStream("/animals.json")));
          var jsonArray = new JSONArray(response.getContentAsString());
   
          var schema = SchemaLoader.load(jsonSchema);
          schema.validate(jsonArray);
      }
      ```

      **Nota:** Debes agregar los siguientes imports:

      ```java
      import org.everit.json.schema.loader.SchemaLoader;
      import org.json.JSONArray;
      import org.json.JSONObject;
      import org.json.JSONTokener;
      ```

1. Finalmente, creas un branch y subes un PR con estos cambios.