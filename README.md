<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Logo de NestJS" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">Un framework progresivo de <a href="https://nodejs.org/" target="_blank">Node.js</a> para construir aplicaciones del lado del servidor eficientes y escalables.</p>

## Descripción

Este repositorio es la plantilla inicial en TypeScript para aplicaciones con el framework NestJS.

## Configuración previa

Antes de ejecutar la aplicación, crea un archivo `.env` en la raíz del proyecto y define todas las variables necesarias (puerto, conexión a base de datos, claves, API Keys, etc.).

## Pasos para instalar y ejecutar

1. Instalar dependencias:

   ```bash
   npm install
   ```
2. Compilar el proyecto:

   ```bash
   npm run build
   ```
3. Iniciar la aplicación:

   ```bash
   npm start
   ```

## Ejecución con Docker

Si prefieres ejecutar con Docker, asegúrate de tener Docker Desktop abierto y en funcionamiento. Luego ejecuta:

```bash
docker-compose up --build
```

Esto construirá la imagen y levantará los contenedores definidos en `docker-compose.yml`.

## Pruebas

Para ejecutar las pruebas del proyecto, utiliza:

```bash
npm run test
```

## Recursos

* Documentación oficial de NestJS: [https://docs.nestjs.com](https://docs.nestjs.com)
* Discord de NestJS: [https://discord.gg/G7Qnnhy](https://discord.gg/G7Qnnhy)
* Máster de cursos oficiales: [https://courses.nestjs.com/](https://courses.nestjs.com/)

## Licencia

Este proyecto está licenciado bajo MIT. Puedes consultar el archivo [LICENSE](https://github.com/nestjs/nest/blob/master/LICENSE) para más detalles.
