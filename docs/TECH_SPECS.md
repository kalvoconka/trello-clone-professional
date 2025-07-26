# 📋 Technical Specifications - Trello Clone

## 🎯 System Overview

### Core Requirements
- **Performance**: <2s page load, <100ms API response
- **Scalability**: 1000+ concurrent users
- **Availability**: 99.9% uptime
- **Security**: Enterprise-grade auth, data protection
- **Compatibility**: Modern browsers, mobile responsive

### User Stories Implemented
- ✅ Como usuario, puedo registrarme y autenticarme
- ✅ Como usuario, puedo crear y gestionar boards
- ✅ Como usuario, puedo crear listas en boards
- ✅ Como usuario, puedo reordenar listas con drag & drop  
- ✅ Como usuario, puedo colaborar en tiempo real
- ✅ Como usuario, puedo invitar otros usuarios a boards

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│  Express API    │◄──►│  PostgreSQL     │
│   (Frontend)    │    │   (Backend)     │    │  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Socket.io     │◄─────────────┘
                        │  (WebSockets)   │
                        └─────────────────┘
```

### Component Architecture
```
Frontend (React)               Backend (Node.js)
┌─────────────────┐           ┌─────────────────┐
│ Pages/          │           │ Routes/         │
│ ├─ Auth         │◄─────────►│ ├─ auth.ts      │
│ ├─ Dashboard    │           │ ├─ boards.ts    │
│ └─ Board        │           │ └─ lists.ts     │
├─────────────────┤           ├─────────────────┤
│ Components/     │           │ Controllers/    │
│ ├─ BoardCard    │           │ ├─ AuthCtrl     │
│ ├─ ListCard     │           │ ├─ BoardCtrl    │
│ └─ DragDrop     │           │ └─ ListCtrl     │
├─────────────────┤           ├─────────────────┤
│ Services/       │           │ Services/       │
│ ├─ authService  │◄─────────►│ ├─ AuthService  │
│ ├─ boardService │           │ ├─ BoardService │
│ └─ socketService│           │ └─ ListService  │
├─────────────────┤           ├─────────────────┤
│ Context/        │           │ Middleware/     │
│ └─ AuthContext  │           │ ├─ auth.ts      │
└─────────────────┘           │ ├─ cors.ts      │
                              │ └─ rateLimit.ts │
                              └─────────────────┘
```

## 🔧 Technical Stack

### Frontend Stack
```json
{
  "framework": "React 17.0.2",
  "language": "TypeScript 4.9.5",
  "styling": "Tailwind CSS 3.3.0",
  "state": "Context API + useState",
  "routing": "React Router DOM 6.8.0",
  "http": "Axios 1.6.0",
  "dragdrop": "react-beautiful-dnd 13.1.1",
  "websockets": "socket.io-client 4.7.2",
  "build": "Create React App 5.0.1"
}
```

### Backend Stack
```json
{
  "runtime": "Node.js 18.17.0",
  "framework": "Express 5.0.0-beta.1",
  "language": "TypeScript 5.1.6",
  "database": "PostgreSQL 15",
  "orm": "Prisma 5.1.1",
  "auth": "jsonwebtoken 9.0.2",
  "crypto": "bcryptjs 2.4.3",
  "websockets": "socket.io 4.7.2",
  "validation": "zod 3.21.4",
  "logging": "winston 3.10.0"
}
```

### DevOps Stack
```json
{
  "containerization": "Docker 24.0.0",
  "orchestration": "docker-compose 3.8",
  "ci_cd": "GitHub Actions",
  "deployment": "Railway / DigitalOcean",
  "monitoring": "Winston + Health checks",
  "testing": "Jest 29.5.0",
  "linting": "ESLint 8.57.0",
  "formatting": "Prettier 3.0.0"
}
```

## 📊 Database Schema

### Entity Relationship Diagram
```
User ||--o{ BoardMember : has
BoardMember }o--|| Board : belongs_to
Board ||--o{ List : contains
List ||--o{ Card : contains
Card }o--|| User : assigned_to
```

### Core Tables
```sql
-- Users table
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Boards table  
CREATE TABLE boards (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Board members (many-to-many)
CREATE TABLE board_members (
  id       TEXT PRIMARY KEY,
  user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
  role     TEXT DEFAULT 'MEMBER',
  UNIQUE(user_id, board_id)
);

-- Lists table
CREATE TABLE lists (
  id       TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Future: Cards table
CREATE TABLE cards (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  list_id     TEXT REFERENCES lists(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  assigned_to TEXT REFERENCES users(id),
  due_date    TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_board_members_user_id ON board_members(user_id);
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_lists_position ON lists(board_id, position);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_position ON cards(list_id, position);
```

## 🔐 Security Specifications

### Authentication Flow
```typescript
// Registration flow
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
↓
bcrypt.hash(password, 12) // 12 rounds
↓
Save to database
↓
Generate JWT tokens
↓
Return: accessToken (15min) + refreshToken (7d, httpOnly)

// Login flow  
POST /api/auth/login
↓
Validate credentials with bcrypt.compare()
↓
Generate new token pair
↓
Rotate refresh token (invalidate old)
↓
Return tokens + user data
```

### JWT Structure
```typescript
// Access Token Payload
{
  "userId": "clh1234567890",
  "email": "user@example.com", 
  "iat": 1640995200,
  "exp": 1640996100, // 15 minutes
  "type": "access"
}

// Refresh Token Payload
{
  "userId": "clh1234567890",
  "tokenId": "refresh_abc123",
  "iat": 1640995200,
  "exp": 1641600000, // 7 days
  "type": "refresh"
}
```

### Security Headers
```typescript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## ⚡ Performance Specifications

### Response Time Targets
```
API Endpoints:
├─ GET /api/health         <50ms   (health check)
├─ POST /api/auth/login    <200ms  (authentication)
├─ GET /api/boards         <300ms  (list user boards)
├─ GET /api/boards/:id     <400ms  (board with lists)
├─ POST /api/boards        <250ms  (create board)
├─ PUT /api/lists/:id      <150ms  (update list)
└─ PUT /api/lists/reorder  <200ms  (reorder lists)

Frontend Metrics:
├─ First Contentful Paint  <1.5s
├─ Largest Contentful Paint <2.5s  
├─ Time to Interactive     <3.0s
├─ Cumulative Layout Shift <0.1
└─ First Input Delay       <100ms
```

### Database Performance
```sql
-- Query performance targets
SELECT * FROM boards WHERE id = ? -- <5ms
SELECT * FROM lists WHERE board_id = ? ORDER BY position -- <10ms
SELECT * FROM board_members WHERE user_id = ? -- <15ms

-- Connection pool configuration
{
  "min": 2,
  "max": 10,
  "acquireTimeoutMillis": 60000,
  "createTimeoutMillis": 30000,
  "destroyTimeoutMillis": 5000,
  "idleTimeoutMillis": 30000
}
```

## 🔄 WebSocket Specifications

### Connection Lifecycle
```typescript
// 1. Client connects with JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, JWT_SECRET);
  socket.userId = decoded.userId;
  next();
});

// 2. Client joins board room
socket.emit('join-board', boardId);
socket.join(`board-${boardId}`);

// 3. Real-time events
socket.on('list-created', (data) => {
  // Validate user has access to board
  // Save to database
  // Broadcast to all users in board room
  io.to(`board-${boardId}`).emit('list-created', newList);
});
```

### Event Schema
```typescript
// Client → Server events
interface ClientEvents {
  'join-board': (boardId: string) => void;
  'leave-board': (boardId: string) => void;
  'list-created': (data: CreateListData) => void;
  'list-updated': (data: UpdateListData) => void;
  'list-deleted': (listId: string) => void;
  'lists-reordered': (boardId: string, orderedLists: List[]) => void;
}

// Server → Client events
interface ServerEvents {
  'list-created': (list: List) => void;
  'list-updated': (list: List) => void;
  'list-deleted': (listId: string) => void;
  'lists-reordered': (lists: List[]) => void;
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'error': (error: { message: string; code: string }) => void;
}
```

## 📱 Responsive Design Specifications

### Breakpoints
```css
/* Tailwind CSS breakpoints */
sm: '640px'   /* Small devices (phones) */
md: '768px'   /* Medium devices (tablets) */  
lg: '1024px'  /* Large devices (laptops) */
xl: '1280px'  /* Extra large devices (desktops) */
2xl: '1536px' /* 2X Large devices (large desktops) */
```

### Mobile-First Layout
```typescript
// Board component responsive behavior
<div className="
  grid 
  grid-cols-1          // Mobile: single column
  md:grid-cols-2       // Tablet: 2 columns  
  lg:grid-cols-3       // Desktop: 3 columns
  xl:grid-cols-4       // Large: 4 columns
  gap-4 
  p-4
">
  {lists.map(list => <ListComponent key={list.id} list={list} />)}
</div>
```

## 🚀 Deployment Specifications

### Production Environment
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile.production
    environment:
      NODE_ENV: production
      PORT: 5000
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'  
        memory: 256M
    
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: trello_production
    resources:
      limits:
        memory: 256M
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Health Check Endpoint
```typescript
// GET /api/health
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});
```

## 📊 Monitoring & Logging

### Log Levels & Structure
```typescript
// Winston configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        requestId: meta.requestId,
        userId: meta.userId,
        ...meta
      });
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.colorize({ all: true })
    })
  ]
});

// Usage examples
logger.info('User logged in', { userId, email, ip: req.ip });
logger.error('Database connection failed', { error: error.message, stack: error.stack });
logger.warn('Rate limit exceeded', { ip: req.ip, endpoint: req.path });
```

### Metrics Collection
```typescript
// Basic metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    activeConnections: io.engine.clientsCount,
    totalRequests: requestCounter,
    errorRate: errorCounter / requestCounter
  });
});
```

---

## 🔮 Future Technical Roadmap

### Phase 5: Enhanced Features
- **Cards system**: Full CRUD with attachments
- **Advanced permissions**: Granular role-based access
- **Search & filters**: Elasticsearch integration
- **File uploads**: S3/CloudFormation integration
- **Notifications**: Push notifications via ServiceWorker

### Phase 6: Scale & Performance  
- **Caching layer**: Redis for sessions and data
- **Database scaling**: Read replicas, connection pooling
- **CDN integration**: CloudFront for static assets
- **Monitoring**: Prometheus + Grafana
- **Security**: Security audit, penetration testing

### Phase 7: Enterprise
- **Multi-tenancy**: Organization-based isolation
- **SSO integration**: SAML, OIDC support
- **API rate limiting**: Per-user, per-organization limits
- **Audit logging**: Compliance-ready audit trails
- **Backup & DR**: Automated backup, disaster recovery