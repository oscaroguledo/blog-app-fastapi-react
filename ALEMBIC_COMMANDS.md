# Alembic Commands

## Local (Without Docker)

### Setup
```bash
# Initialize Alembic (already done)
alembic init alembic

# Generate a new migration
alembic revision --autogenerate -m "description of changes"

# Apply migrations to the database
alembic upgrade head

# Rollback to previous version
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>

# View current revision
alembic current

# View migration history
alembic history

# View SQL for a migration (without executing)
alembic upgrade head --sql
```

## With Docker

### Setup
```bash
# Generate a new migration
docker-compose exec backend alembic revision --autogenerate -m "description of changes"

# Apply migrations to the database
docker-compose exec backend alembic upgrade head

# Rollback to previous version
docker-compose exec backend alembic downgrade -1

# Rollback to specific version
docker-compose exec backend alembic downgrade <revision_id>

# View current revision
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history

# View SQL for a migration (without executing)
docker-compose exec backend alembic upgrade head --sql
```

## Common Workflow

1. **Make changes to models** - Update your SQLAlchemy models in `backend/models/`

2. **Generate migration** - Create a new migration file:
   ```bash
   # Local
   cd backend
   alembic revision --autogenerate -m "describe your changes"

   # Docker
   docker-compose exec backend alembic revision --autogenerate -m "describe your changes"
   ```

3. **Review migration** - Check the generated migration file in `backend/alembic/versions/`

4. **Apply migration** - Run the migration against your database:
   ```bash
   # Local
   alembic upgrade head

   # Docker
   docker-compose exec backend alembic upgrade head
   ```

## Notes

- Always review auto-generated migrations before applying them
- The `env.py` file handles converting async database URLs to sync for Alembic
- Model imports in `env.py` must be in the correct order (User before Post, etc.)
- Run migrations from the `backend` directory (local) or use `docker-compose exec backend` (Docker)
- Ensure the database is running before applying migrations
