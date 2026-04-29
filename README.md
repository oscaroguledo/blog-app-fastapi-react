# Blog Platform

A full-stack blog application built with modern technologies. Features user authentication, post management, categories, tags, comments, analytics, and an admin dashboard.

## Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **PostgreSQL** - Relational database for data persistence
- **Redis** - Caching and task queue
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Celery** - Background task processing
- **Pydantic** - Data validation and serialization
- **Pytest** - Testing framework

### Frontend
- **React 18** - UI library with hooks and functional components
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization for analytics
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Docker Compose** - Multi-container orchestration

## Features

- **User Management**: Registration, authentication, profile management
- **Content Management**: Create, edit, publish posts with rich text
- **Categories & Tags**: Organize content with hierarchical categories and tags
- **Comments**: Nested commenting system
- **Search & Filter**: Full-text search with filters by category, author, date
- **Analytics Dashboard**: View traffic stats, popular posts, engagement metrics
- **Admin Panel**: Manage users, posts, comments, and site settings
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **SEO Optimized**: Meta tags, structured data, semantic HTML

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.12+ (for local backend development)
- Git

## Quick Start (Docker)

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/oscaroguledo/blog-app-fastapi-react.git
cd blog-app-fastapi-react

# Create backend environment file
cp backend/.env.example backend/.env

# Start all services
docker compose up -d --build

# Apply database migrations
docker compose exec backend alembic upgrade head

# Seed the database with sample data
docker compose exec postgres psql -U postgres -d blog_db -f /tmp/seed_data.sql
```

The application will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Development Setup

### Backend (Local)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start Celery worker (in separate terminal)
celery -A worker.celery_app worker --loglevel=info
```

### Frontend (Local)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend dev server will start at http://localhost:5173

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_user_routes.py
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test -- --run

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Project Structure

```
blog-app-fastapi-react/
├── backend/                 # FastAPI backend
│   ├── alembic/            # Database migrations
│   ├── models/             # SQLAlchemy models
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── tests/              # Pytest tests
│   ├── worker/             # Celery tasks
│   └── main.py             # Application entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── __tests__/     # Unit tests
│   │   └── App.tsx        # Main app component
│   ├── e2e/               # Playwright E2E tests
│   └── Dockerfile         # Frontend container
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## API Endpoints

The backend exposes a RESTful API with the following main endpoints:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /posts` - List posts
- `POST /posts` - Create post
- `GET /posts/{id}` - Get post details
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `GET /categories` - List categories
- `GET /tags` - List tags
- `GET /analytics/overview` - Get analytics data

Full API documentation available at `/docs` when running the backend.

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/blog_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/1
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI powered by [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/)
- Database managed by [PostgreSQL](https://www.postgresql.org/)
