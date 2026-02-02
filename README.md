# 🚀 Backend Sinapsis Test - Marketing Campaigns API

API RESTful para la gestión y programación de campañas de marketing masivas, desarrollada con **NestJS** y arquitectura Serverless.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0C05?style=for-the-badge&logo=typeorm&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)

## 📋 Características Principales

- **Arquitectura Hexagonal / Modular:** Código desacoplado y escalable.
- **Transacciones ACID:** Garantía de integridad de datos al crear campañas y mensajes (Rollback automático ante fallos).
- **Validación Estricta:** Uso de DTOs, `class-validator` y `ValidationPipe` global.
- **QueryBuilder Optimizado:** Consultas SQL eficientes para reportes de dashboard, evitando sobrecarga en memoria.
- **Documentación:** Swagger OpenAPI integrado y automatizado.
- **Gestión de Usuarios y Clientes:** Módulos completos con CRUD, Paginación y Soft Delete.
- **Testing Avanzado:** Cobertura de pruebas unitarias robustas con Jest para Servicios y DTOs. Incluye mocks de repositorios, simulación de transacciones (`QueryRunner`) y manejo de excepciones de base de datos (SQL Errors).

---

## 🛠️ Requisitos Previos

- Docker & Docker Compose
- Instalar [Bun](https://bun.sh/) (v1.0 o superior).

## 🚀 Ejecución
Este proyecto utiliza el runtime de Bun para desarrollo local.

# Instalar dependencias
bun install

# Modo Desarrollo (NestJS Puro - Recomendado)
bun run start:dev

# Modo Serverless (Simulación AWS Lambda)
bun run start:sls

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/JonathanLara27/backend-sinapsis-test
cd backend-sinapsis-test

```

### 2. Instalar dependencias

```bash
pnpm install

```

### 3. Levantar Base de Datos (Docker)

El proyecto incluye un `docker-compose.yml` configurado con MySQL 8.

```bash
docker-compose up -d

```

*El contenedor expondrá el puerto `3307` para evitar conflictos con instalaciones locales de MySQL.*

### 4. Ejecutar la aplicación (Modo Offline/Local)

Usamos `serverless-offline` para simular el entorno Lambda localmente.

```bash
npm run build
npx serverless offline

```

La API estará disponible en: `http://localhost:3000/dev`

---

## 📚 Documentación API (Swagger)

Una vez levantada la aplicación, accede a la documentación interactiva:

👉 **http://localhost:3000/dev/api/docs**

### Endpoints Clave

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `POST` | `/campaigns` | Crea una campaña y sus mensajes de forma transaccional. Requiere nombre, fecha y lista de mensajes. |
| `GET` | `/reports/dashboard` | Reporte de mensajes agrupados por estado. Filtros: `month` (obligatorio), `clientId` (opcional). |

---

## 🧪 Testing

El proyecto cuenta con pruebas unitarias robustas que cubren casos de éxito, errores y validaciones.

```bash
# Ejecutar todos los tests
npm run test

# Ver cobertura (Coverage)
npm run test:cov

```

---

## 🏛️ Decisiones de Diseño y Arquitectura

1. **Patrón Repository & QueryBuilder:** Se utilizó `QueryBuilder` en el módulo de reportes para delegar la carga de procesamiento (agrupación y conteo) al motor de base de datos, optimizando el rendimiento frente a grandes volúmenes de datos.
2. **Transacciones Manuales (`QueryRunner`):** Para el endpoint de creación de campañas, se optó por una transacción manual controlada. Esto asegura la atomicidad: no se crean campañas sin mensajes, ni mensajes huérfanos.
3. **Principios SOLID:**
* **SRP:** Separación estricta entre lógica de negocio (Service), validación de entrada (DTO) y definición de datos (Entity).
* **DIP:** Inyección de dependencias en constructores para facilitar el testing y desacoplar componentes.



---

## ☁️ Estrategia de Despliegue (AWS)

Para llevar este proyecto a un entorno productivo en AWS utilizando Serverless Framework, se deben considerar las siguientes configuraciones de infraestructura:

1. **Infraestructura de Datos (Amazon RDS):**
* Provisionar una instancia **Amazon RDS (MySQL)** o Aurora Serverless.
* Configurar los Security Groups para permitir tráfico entrante en el puerto `3306` exclusivamente desde la VPC de las Lambdas.


2. **Configuración de Red (`serverless.ts`):**
* Configurar la sección `vpc` definiendo `subnetIds` (privadas) y `securityGroupIds`. Esto es obligatorio para que la Lambda pueda "ver" a la base de datos RDS.


3. **Gestión de Secretos (AWS SSM):**
* No utilizar archivos `.env` en producción. Se deben mapear las variables de entorno (`DB_HOST`, `DB_PASSWORD`, etc.) utilizando **AWS Systems Manager (Parameter Store)**.


```yaml
environment:
  DB_HOST: ${ssm:/sinapsis/prod/DB_HOST}

```


4. **Despliegue:**
```bash
# Configurar credenciales IAM
serverless config credentials --provider aws --key <KEY> --secret <SECRET>

# Desplegar a stage de producción
serverless deploy --stage prod

```



---

## 👤 Autor

Desarrollado por **Jonathan Lara**.