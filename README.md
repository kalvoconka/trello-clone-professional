# 🚀 Trello Clone Professional

**Estado**: ✅ MVP Completado | 🔄 En Review del Equipo | 🎯 Preparado para Producción

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Un clon profesional de Trello construido con tecnologías modernas para colaboración en tiempo real.

## 🚀 Características

- ✅ Autenticación JWT con refresh tokens
- ✅ Creación y gestión de boards, listas y cards
- ✅ Drag & Drop fluido entre listas
- ✅ Colaboración en tiempo real con WebSockets
- ✅ Comentarios y actividad en cards
- ✅ Etiquetas personalizables
- ✅ Asignación de usuarios
- ✅ Fechas de vencimiento y recordatorios
- ✅ Búsqueda y filtros avanzados
- ✅ Responsive design

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT + bcrypt
- **Tiempo real**: Socket.io
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 17 + TypeScript
- **Estilos**: Tailwind CSS + HeadlessUI
- **Estado**: Zustand
- **HTTP Client**: Axios + React Query
- **Routing**: React Router v6
- **Drag & Drop**: React DnD
- **Testing**: Jest + React Testing Library

### DevOps
- **Contenedores**: Docker + docker-compose
- **CI/CD**: GitHub Actions
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Monitoreo**: Sentry

## 📁 Estructura del Proyecto

```
trello-clone/
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/        # Páginas/Vistas
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── store/        # Estado global (Zustand)
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilidades
│   └── public/
├── backend/               # API REST + WebSockets
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── models/       # Modelos Prisma
│   │   ├── routes/       # Rutas API
│   │   ├── middleware/   # Middleware custom
│   │   ├── services/     # Lógica de negocio
│   │   ├── utils/        # Utilidades
│   │   └── websocket/    # Socket.io handlers
│   └── prisma/
├── docker/               # Configuración Docker
└── .github/             # GitHub Actions
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- PostgreSQL 13+
- Docker y docker-compose (opcional)

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/trello-clone.git
   cd trello-clone
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Instalar dependencias**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Configurar base de datos**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Iniciar servicios**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

### Instalación con Docker

```bash
docker-compose up -d
```

## 📋 Scripts Disponibles

### Backend
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm run start` - Producción
- `npm run test` - Ejecutar tests
- `npm run lint` - Ejecutar linter

### Frontend
- `npm start` - Desarrollo
- `npm run build` - Build producción
- `npm test` - Ejecutar tests
- `npm run lint` - Ejecutar linter

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 📝 API Documentation

La documentación de la API está disponible en `/api/docs` cuando el servidor está en ejecución.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Trabajo inicial* - [tu-github](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Inspirado en [Trello](https://trello.com)
- Iconos de [Heroicons](https://heroicons.com)
- UI Components de [HeadlessUI](https://headlessui.dev)