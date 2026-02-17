# E-commerce Platform - Deployment Guide

This guide will walk you through deploying and running the e-commerce platform on your system.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download from: https://www.docker.com/products/docker-desktop
   - Version: 20.10 or higher

2. **Docker Compose**
   - Usually included with Docker Desktop
   - For Linux: https://docs.docker.com/compose/install/
   - Version: 2.0 or higher

### Verify Installation

Open a terminal/command prompt and run:

```bash
docker --version
docker-compose --version
```

You should see version numbers for both commands.

---

## Deployment Steps

### Step 1: Navigate to Project Directory

```bash
cd c:/integravity/Ecom
```

### Step 2: Configure Environment Variables

1. **Copy the example environment file**:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

2. **Edit the .env file** with your preferred text editor:

```bash
# Windows
notepad .env

# Linux/Mac
nano .env
# or
vim .env
```

3. **Update these critical settings**:

```env
# Database - Change the password!
POSTGRES_PASSWORD=your_secure_password_here

# JWT Secret - Generate a random 32+ character string
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this

# Stripe (for payments) - Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email (optional - for order notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

> **Note**: For development/testing, you can use the default values, but **NEVER use default passwords in production!**

### Step 3: Deploy the Platform

#### Option A: Quick Start Script (Recommended)

**Windows**:
```bash
start.bat
```

**Linux/Mac**:
```bash
chmod +x start.sh
./start.sh
```

The script will:
- Check Docker installation
- Build all containers
- Start all services
- Display access URLs and credentials

#### Option B: Manual Docker Compose

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# Wait for services to initialize (about 30 seconds)
# Then check status
docker-compose ps
```

### Step 4: Verify Deployment

1. **Check all services are running**:

```bash
docker-compose ps
```

You should see all services with status "Up" or "Up (healthy)":
- ecom_postgres
- ecom_redis
- ecom_auth_service
- ecom_product_service
- ecom_cart_service
- ecom_order_service
- ecom_payment_service
- ecom_delivery_service
- ecom_frontend
- ecom_admin
- ecom_nginx

2. **Check service logs** (if any service is not running):

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs auth_service
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Step 5: Access the Applications

Once all services are running, open your web browser:

#### Customer Frontend (PWA)
```
http://localhost:3000
```

#### Admin Portal
```
http://localhost:3001
```

#### API Documentation (Interactive)
- Auth Service: http://localhost/api/auth/docs
- Product Service: http://localhost/api/products/docs
- Cart Service: http://localhost/api/cart/docs
- Order Service: http://localhost/api/orders/docs
- Payment Service: http://localhost/api/payment/docs
- Delivery Service: http://localhost/api/delivery/docs

---

## Default Credentials

### Admin Account
```
Email:    admin@ecommerce.com
Password: admin123
```

> **Important**: Change the admin password immediately after first login in production!

---

## Testing the Platform

### 1. Test API Endpoints

Visit any API documentation URL (e.g., http://localhost/api/products/docs) and try the interactive API:

1. Click on an endpoint (e.g., `GET /categories`)
2. Click "Try it out"
3. Click "Execute"
4. View the response

### 2. Create a Test User

Using the Auth API (http://localhost/api/auth/docs):

1. Go to `POST /register`
2. Click "Try it out"
3. Enter user details:
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123",
  "full_name": "Test User"
}
```
4. Click "Execute"

### 3. Login and Get Token

1. Go to `POST /login`
2. Enter credentials:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
3. Copy the `access_token` from the response

### 4. Test Protected Endpoints

1. Click the "Authorize" button at the top of any API docs page
2. Enter: `Bearer YOUR_ACCESS_TOKEN`
3. Click "Authorize"
4. Now you can test protected endpoints like `GET /me`

---

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f product_service

# Last 100 lines
docker-compose logs --tail=100
```

### Restart a Service

```bash
# Restart specific service
docker-compose restart product_service

# Restart all services
docker-compose restart
```

### Stop the Platform

```bash
# Stop all services (keeps data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d product_service
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U ecom_user -d ecommerce

# Common SQL commands:
\dt          # List tables
\d users     # Describe users table
SELECT * FROM users;
\q           # Quit
```

### Access Redis

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Common Redis commands:
KEYS *                    # List all keys
GET cart:1               # Get cart for user 1
FLUSHALL                 # Clear all data (careful!)
exit                     # Exit
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
1. Find what's using the port:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

2. Either stop that process or change the port in `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3001:3000"  # Change 3000 to another port
```

### Issue: Services Not Starting

**Error**: Service exits immediately or shows "unhealthy"

**Solution**:
1. Check logs:
```bash
docker-compose logs service_name
```

2. Common fixes:
   - Database not ready: Wait 30 seconds and check again
   - Environment variables: Verify `.env` file exists and is correct
   - Port conflicts: Change ports in `docker-compose.yml`

### Issue: Cannot Connect to Database

**Error**: `could not connect to server: Connection refused`

**Solution**:
1. Ensure PostgreSQL is running:
```bash
docker-compose ps postgres
```

2. Check PostgreSQL logs:
```bash
docker-compose logs postgres
```

3. Restart PostgreSQL:
```bash
docker-compose restart postgres
```

### Issue: Frontend Shows "Cannot Connect to API"

**Solution**:
1. Verify NGINX is running:
```bash
docker-compose ps nginx
```

2. Check NGINX logs:
```bash
docker-compose logs nginx
```

3. Verify backend services are running:
```bash
docker-compose ps
```

### Issue: Docker Compose Command Not Found

**Solution**:
- Try `docker compose` (without hyphen) - newer Docker versions
- Or install Docker Compose: https://docs.docker.com/compose/install/

---

## Production Deployment

For production deployment on a Linux server:

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Transfer Files

```bash
# From your local machine
scp -r c:/integravity/Ecom user@your-server:/home/user/
```

### 3. Configure for Production

1. Update `.env` with production values
2. Set strong passwords
3. Configure real Stripe keys
4. Set up SSL certificates

### 4. Set Up SSL (Optional but Recommended)

1. Install Certbot:
```bash
sudo apt install certbot
```

2. Get SSL certificate:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. Update `nginx/nginx.conf` to use SSL

### 5. Deploy

```bash
cd /home/user/Ecom
docker-compose up -d
```

---

## Monitoring

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Checks

```bash
# Check all health endpoints
curl http://localhost/api/auth/health
curl http://localhost/api/products/health
curl http://localhost/api/cart/health
curl http://localhost/api/orders/health
curl http://localhost/api/payment/health
curl http://localhost/api/delivery/health
```

---

## Backup and Restore

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U ecom_user ecommerce > backup.sql

# With timestamp
docker-compose exec postgres pg_dump -U ecom_user ecommerce > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U ecom_user ecommerce < backup.sql
```

---

## Next Steps

1. **Test all features** using the API documentation
2. **Create test products** via the Product Service API
3. **Place test orders** to verify the complete flow
4. **Customize** the frontend applications (when implemented)
5. **Configure** payment gateway with real Stripe keys
6. **Set up** email notifications for orders

---

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Review this guide's troubleshooting section
4. Check the main [README.md](file:///c:/integravity/Ecom/README.md)

---

## Quick Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart service_name

# Rebuild
docker-compose up --build -d

# Check status
docker-compose ps

# Access database
docker-compose exec postgres psql -U ecom_user -d ecommerce

# Access Redis
docker-compose exec redis redis-cli
```

---

**You're all set! 🚀** The e-commerce platform is now running and ready for testing.
