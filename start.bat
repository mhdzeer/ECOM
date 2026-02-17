@echo off
REM E-commerce Platform Quick Start Script for Windows

echo =========================================
echo E-commerce Platform - Quick Start
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo X Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo X Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo + Docker and Docker Compose are installed
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo ! Please edit .env file with your configuration before proceeding
    echo   Especially update:
    echo   - POSTGRES_PASSWORD
    echo   - JWT_SECRET
    echo   - STRIPE_SECRET_KEY
    echo.
    pause
)

echo Starting E-commerce Platform...
echo.

REM Build and start all services
docker-compose up --build -d

echo.
echo Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo Service Status:
docker-compose ps

echo.
echo =========================================
echo + E-commerce Platform is running!
echo =========================================
echo.
echo Access the applications:
echo   Customer Frontend: http://localhost:3100
echo   Admin Portal:      http://localhost:3101
echo   API Gateway:       http://localhost:8080/api
echo.
echo API Documentation:
echo   Auth Service:      http://localhost:8080/api/auth/docs
echo   Product Service:   http://localhost:8080/api/products/docs
echo   Cart Service:      http://localhost:8080/api/cart/docs
echo   Order Service:     http://localhost:8080/api/orders/docs
echo   Payment Service:   http://localhost:8080/api/payment/docs
echo   Delivery Service:  http://localhost:8080/api/delivery/docs
echo.
echo Default Admin Credentials:
echo   Email:    admin@ecommerce.com
echo   Password: admin123
echo.
echo View logs: docker-compose logs -f [service-name]
echo Stop all:  docker-compose down
echo.
pause
