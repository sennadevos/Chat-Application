# Chat Application Backend

The backend layer of the chat application. It is built with Spring Boot 3.5.8, Java 21, WebSockets, MySQL, and Redis.

## Features

- **User Authentication**: JWT-based authentication with SMS verification via Vonage
- **Real-time Messaging**: WebSocket support for instant message delivery
- **Channel Management**: Create channels and manage members
- **Message Pagination**: Efficient message retrieval with pagination support
- **Redis Session Management**: Fast session storage and retrieval
- **Health Monitoring**: Built-in (very minimal) health check endpoint

## Technology Stack

- **Java**: 21
- **Spring Boot**: 3.5.8
- **Database**: MySQL 8.0
- **Cache/Sessions**: Redis 7
- **WebSockets**: STOMP protocol
- **Security**: Spring Security with custom JWT/Session authentication
- **Build Tool**: Gradle 9.2.1

## Prerequisites

- Java 21 or higher
- Docker and Docker Compose (recommended)
- OR MySQL 8.0+ and Redis 7+ installed locally

## Quick Start with Docker Compose

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MySQL database on port 3306
   - Redis on port 6379
   - Backend application on port 8080

2. **Check application health:**
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

## Manual Setup

### 1. Database Setup

Start MySQL and create the database:
```sql
CREATE DATABASE exampledb;
CREATE USER 'user'@'%' IDENTIFIED BY 'example';
GRANT ALL PRIVILEGES ON exampledb.* TO 'user'@'%';
FLUSH PRIVILEGES;
```

### 2. Redis Setup

Start Redis:
```bash
redis-server
```

### 3. Application Configuration

Copy the example environment file and configure:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
- Database credentials
- Redis connection details
- JWT secret (CHANGE IN PRODUCTION!)
- Vonage API credentials (optional, for SMS)

### 4. Build and Run

```bash
# Build the application
./gradlew build

# Run the application
./gradlew bootRun
```

The application will start on `http://localhost:8080/api`

## API Endpoints

### Public Endpoints

- `GET /api/health` - Application health check
- `GET /api/status` - Application status and version
- `GET /api/info` - Application information
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify phone number with SMS code

### Protected Endpoints (Require Authentication)

**Users:**
- `GET /api/users` - Get all users (Admin only)

**Channels:**
- `GET /api/channels/{id}` - Get channel details
- `POST /api/channels/{id}/members` - Add member to channel
- `DELETE /api/channels/{id}/members/{userId}` - Remove member from channel

**Messages:**
- `GET /api/channels/{channelId}/messages` - Get messages (with pagination)
  - Query params: `page`, `size`, `sortBy`, `sortDirection`
- `POST /api/channels/{channelId}/messages` - Send a message

### WebSocket Endpoint

- `ws://localhost:8080/api/ws?token={sessionToken}` - WebSocket connection for real-time messages

## Authentication

The API uses session-based authentication with tokens stored in Redis.

1. **Register**: `POST /api/auth/register` with phone, username, password
2. **Verify**: `POST /api/auth/verify` with phone and SMS code
3. **Login**: `POST /api/auth/login` with username and password
4. **Use token**: Include in `Authorization: Bearer {token}` header

### Example Authentication Flow

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "username": "testuser", "password": "password123"}'

# Verify phone (requires SMS code)
curl -X POST http://localhost:8080/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "code": "123456"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

## Development

### Project Structure

```
src/main/java/com/hethond/chatbackend/
├── configuration/          # Spring configuration classes
│   ├── RedisConfig.java
│   ├── WebSecurityConfig.java
│   ├── WebSocketConfig.java
│   └── GlobalExceptionHandler.java
├── controllers/            # REST API endpoints
├── entities/              # JPA entities and DTOs
├── exceptions/            # Custom exceptions
├── repositories/          # Spring Data repositories
├── security/              # Security filters and handlers
├── services/              # Business logic
└── response/              # API response wrappers
```

### Configuration

Key configuration in `src/main/resources/application.properties`:

- **Server**: Port and context path
- **Database**: JDBC URL, credentials
- **Redis**: Host and port
- **JPA**: Hibernate settings
- **JWT**: Secret and expiration
- **Vonage**: SMS API credentials (optional)

### Testing

```bash
# Run tests
./gradlew test

# Run with test coverage
./gradlew test jacocoTestReport
```

## Production Deployment

### Important Security Considerations

1. **Change default secrets**: Update `app.jwtSecret` in production
2. **Use environment variables**: Don't commit sensitive data
3. **Enable HTTPS**: Configure SSL/TLS certificates
4. **Database security**: Use strong passwords and network isolation
5. **Redis authentication**: Set a Redis password in production
6. **CORS configuration**: Update allowed origins for your frontend

### Environment Variables

Override application.properties with environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/exampledb
SPRING_DATASOURCE_USERNAME=your_user
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_REDIS_HOST=your-redis-host
SPRING_REDIS_PORT=6379
APP_JWT_SECRET=your_production_secret_here
```

### Docker Production Build

```bash
# Build the Docker image
docker build -t chat-backend:latest .

# Run with environment variables
docker run -d \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/chatdb \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=password \
  chat-backend:latest
```
