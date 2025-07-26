# Prisma Migration Strategy

## Overview
This document outlines our database migration strategy using Prisma for the Trello Clone project.

## Development Workflow

### 1. Schema Changes
```bash
# Modify schema.prisma
# Generate migration
npx prisma migrate dev --name descriptive_migration_name

# Migration creates:
# - SQL file in prisma/migrations/
# - Updates database
# - Regenerates Prisma Client
```

### 2. Migration Naming Convention
- `add_user_table`
- `add_email_index_to_users`
- `update_board_permissions`
- `fix_cascade_delete_cards`

### 3. Team Collaboration
```bash
# After pulling changes with new migrations
npx prisma migrate dev

# Reset database if needed (CAUTION: deletes all data)
npx prisma migrate reset
```

## Production Deployment

### 1. Pre-deployment Checklist
- [ ] Test migrations on staging environment
- [ ] Backup production database
- [ ] Review migration SQL for breaking changes
- [ ] Prepare rollback plan

### 2. Deployment Process
```bash
# Deploy pending migrations
npx prisma migrate deploy

# Verify deployment
npx prisma migrate status
```

### 3. Zero-Downtime Migrations
For breaking changes:
1. **Expand** - Add new columns/tables
2. **Migrate** - Copy data
3. **Contract** - Remove old columns

Example:
```prisma
// Step 1: Add new column
model User {
  email     String  @unique
  emailNew  String? // Temporary
}

// Step 2: Copy data (in application code)
// Step 3: Switch to new column
// Step 4: Remove old column
```

## Rollback Strategy

### 1. Before Production
```bash
# Create down migration
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.backup.prisma \
  --script > rollback.sql
```

### 2. Emergency Rollback
```sql
-- Keep rollback scripts for each migration
-- Apply manually if needed
BEGIN;
  -- Rollback SQL here
COMMIT;
```

## Best Practices

### 1. DO's
- ✅ Always review generated SQL
- ✅ Test migrations on copy of production data
- ✅ Use transactions for data migrations
- ✅ Keep migrations small and focused
- ✅ Document breaking changes

### 2. DON'Ts
- ❌ Don't edit migration files after applied
- ❌ Don't use `migrate reset` in production
- ❌ Don't skip migrations
- ❌ Don't rename columns directly (use expand/contract)

## CI/CD Integration

### GitHub Actions
```yaml
- name: Deploy Database
  run: |
    npx prisma migrate deploy
    npx prisma generate
```

### Health Checks
```typescript
// Verify database connection
await prisma.$queryRaw`SELECT 1`
```

## Monitoring

### Migration Status
```bash
# Check pending migrations
npx prisma migrate status

# View migration history
npx prisma migrate resolve
```

### Alerts
- Set up alerts for failed migrations
- Monitor migration duration
- Track schema drift

## Disaster Recovery

### Backup Schedule
- **Production**: Daily automated backups
- **Retention**: 30 days
- **Test Restores**: Weekly

### Recovery Steps
1. Stop application
2. Restore database backup
3. Apply migrations up to backup point
4. Resume application

## Migration Template
```sql
-- Migration: add_user_preferences
-- Author: [Name]
-- Date: [Date]
-- Breaking: No

BEGIN;

-- Add new table
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

COMMIT;
```