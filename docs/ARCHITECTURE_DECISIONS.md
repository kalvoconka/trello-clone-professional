# 🏗️ Architecture Decision Records (ADRs)

## Decisiones Técnicas Fundamentales

### ADR-001: Stack Tecnológico Principal
**Status**: ✅ Decidido  
**Fecha**: Sprint 1  
**Contexto**: Necesidad de stack moderno, type-safe y escalable

**Decisión**: 
- **Frontend**: React 17 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express 5 + TypeScript  
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.io WebSockets

**Razón**:
- TypeScript end-to-end para type safety
- React ecosystem maduro y conocido
- PostgreSQL para datos relacionales complejos
- Prisma para migrations y type safety DB

**Consecuencias**:
- ✅ Development velocity alta
- ✅ Type safety completa
- ⚠️ Learning curve para Prisma
- ⚠️ React 17 (no concurrent features)

---

### ADR-002: Arquitectura de Autenticación
**Status**: ✅ Implementado  
**Fecha**: Sprint 2  

**Decisión**: JWT + Refresh Token Rotation
- Access tokens de corta duración (15min)
- Refresh tokens seguros con rotación
- bcrypt para password hashing
- HttpOnly cookies para refresh tokens

**Alternativas Consideradas**:
- Session-based auth → Rechazada (no scalable)
- OAuth-only → Rechazada (complejidad innecesaria)
- Passport.js → Rechazada (over-engineering)

**Implementación**:
```typescript
// JWT payload structure
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
```

---

### ADR-003: Real-time Architecture  
**Status**: ✅ Implementado  
**Fecha**: Sprint 3

**Decisión**: Socket.io con room-based isolation
- Un room por board (`board-${boardId}`)
- JWT authentication en WebSocket handshake
- Event-driven updates con optimistic UI

**Alternativas Consideradas**:
- Server-Sent Events → Rechazada (unidirectional)
- WebRTC → Rechazada (overkill para texto)
- Firebase Realtime → Rechazada (vendor lock-in)

**Event Schema**:
```typescript
// Client → Server events
interface SocketEvents {
  'join-board': (boardId: string) => void;
  'list-created': (listData: CreateListData) => void;
  'list-updated': (listData: UpdateListData) => void;
  'lists-reordered': (boardId: string, lists: List[]) => void;
}

// Server → Client events  
interface SocketCallbacks {
  'list-created': (list: List) => void;
  'list-updated': (list: List) => void;
  'lists-reordered': (lists: List[]) => void;
  'error': (error: { message: string }) => void;
}
```

---

### ADR-004: Estado Frontend
**Status**: ✅ Decidido  
**Fecha**: Sprint 2

**Decisión**: Context API + useState
- Context para auth state global
- useState local para UI state
- No Redux (overkill para MVP)

**Razón**:
- Simplicidad sobre escalabilidad prematura
- React Context suficiente para auth
- Menos boilerplate que Redux

**Migración Futura**:
- Si >10 contextos → considerar Zustand
- Si state logic complejo → considerar Redux Toolkit

---

### ADR-005: Database Schema Design
**Status**: ✅ Implementado  
**Fecha**: Sprint 1

**Decisión**: Normalized schema con cascade deletes
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  boards   BoardMember[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Board {
  id          String @id @default(cuid())
  title       String
  description String?
  members     BoardMember[]
  lists       List[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BoardMember {
  id      String @id @default(cuid())
  userId  String
  boardId String
  role    BoardRole @default(MEMBER)
  user    User @relation(fields: [userId], references: [id], onDelete: Cascade)
  board   Board @relation(fields: [boardId], references: [id], onDelete: Cascade)
  @@unique([userId, boardId])
}

enum BoardRole {
  OWNER
  ADMIN  
  MEMBER
}
```

**Decisiones Clave**:
- CUID vs UUID → CUID (shorter, web-safe)
- Soft deletes vs Hard deletes → Hard deletes (simpler)
- Role-based access → Enum con futuro granular

---

### ADR-006: Error Handling Strategy
**Status**: ✅ Implementado  
**Fecha**: CTO Review

**Decisión**: Structured error handling con Winston logging
```typescript
// Error response structure
interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

// Success response structure  
interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string;
}
```

**Logging Strategy**:
- Winston para structured logging
- Different levels: error, warn, info, debug
- Request correlation IDs
- Error aggregation con Sentry (futuro)

---

### ADR-007: Testing Strategy
**Status**: 🔄 Parcial  
**Fecha**: Sprint 1

**Decisión**: Jest + Supertest + React Testing Library
- Unit tests para services y utils
- Integration tests para API endpoints
- Component tests para UI crítica
- E2E tests para user flows principales

**Coverage Targets**:
- Services: >90%
- Controllers: >80%  
- Components: >70%
- Overall: >80%

**Pendiente**:
- [ ] Implementar tests completos
- [ ] CI/CD integration
- [ ] Performance testing

---

### ADR-008: Deployment Strategy
**Status**: ✅ Decidido  
**Fecha**: CTO Review

**Decisión**: Multi-stage Docker con Railway deployment
```dockerfile
# Production Dockerfile structure
FROM node:18-alpine AS builder
# Build stage

FROM node:18-alpine AS production  
# Runtime stage with security hardening
```

**Deployment Options**:
1. **Railway** (recomendado MVP) - $10-20/mes
2. **DigitalOcean** (escalamiento) - $20-50/mes
3. **Self-hosted** (máximo control)

**CI/CD Pipeline**:
- GitHub Actions
- Automated testing
- Automated deployment on merge to main
- Environment promotion (dev → staging → prod)

---

### ADR-009: Security Decisions
**Status**: ✅ Implementado  
**Fecha**: CTO Review

**Decisiones**:
- Rate limiting: 100 req/15min por IP
- CORS: Strict origin control
- Helmet.js para security headers
- bcrypt rounds: 12 (balance security/performance)
- JWT secrets: 32+ character crypto-strong

**Input Validation**:
- Zod schemas para API validation
- Prisma para SQL injection prevention
- XSS protection via React (automatic escaping)

**Pendiente**:
- [ ] Security audit profesional
- [ ] Penetration testing
- [ ] OWASP compliance check

---

### ADR-010: Monitoring & Observability
**Status**: 🔄 Planificado  
**Fecha**: Fase 5

**Decisión**: Winston + Health checks + métricas básicas
```typescript
// Health check endpoint
GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0",
  "uptime": 86400
}
```

**Futuro (Fase 6)**:
- Prometheus + Grafana
- Application metrics
- User behavior analytics
- Error tracking con Sentry

---

## 🔄 Decisiones Pendientes

### ADR-011: State Management Evolution
**Trigger**: Cuando el state se vuelva complejo
**Opciones**: Zustand, Redux Toolkit, Valtio
**Timeline**: Fase 5

### ADR-012: Database Scaling
**Trigger**: >1000 usuarios concurrentes
**Opciones**: Read replicas, Connection pooling, Redis cache
**Timeline**: Fase 6

### ADR-013: File Storage Strategy  
**Trigger**: Cuando agreguemos attachments
**Opciones**: S3, Cloudinary, local storage
**Timeline**: Sprint 5A

### ADR-014: Notification System
**Trigger**: Sprint 5C
**Opciones**: Push notifications, Email, In-app
**Timeline**: Fase 5

---

## 📊 Métricas de Decisiones

### Technical Debt Score: 2/10
- ✅ Clean architecture
- ✅ Type safety
- ⚠️ Test coverage pendiente
- ⚠️ Performance optimization pendiente

### Scalability Ready: 7/10
- ✅ Database design escalable
- ✅ Stateless backend
- ✅ Docker containers
- ⚠️ Caching layer pendiente
- ⚠️ Load balancing pendiente

### Security Score: 8/10
- ✅ Authentication robust
- ✅ Input validation
- ✅ SQL injection prevention
- ⚠️ Security audit pendiente

---

**Próxima revisión de ADRs**: Después de team review (Fase 4)