# Port Configuration

This project uses the following custom ports to avoid conflicts with common system services:

## External Ports (Host Machine)

| Service | Default Port | Custom Port | Internal Port |
|---------|-------------|-------------|---------------|
| NGINX (HTTP) | 80 | **39080** | 80 |
| NGINX (HTTPS) | 443 | **39443** | 443 |
| Customer Frontend | 3000 | **39100** | 3000 |
| Admin Portal | 3001 | **39101** | 3000 |
| PostgreSQL | 5432 | **39432** | 5432 |
| Redis | 6379 | **39379** | 6379 |

## Access URLs

- **Customer Frontend**: http://localhost:3100
- **Admin Portal**: http://localhost:3101
- **API Gateway**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/{service}/docs

## Changing Ports

To change ports, edit `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # Change 8080 to your preferred port
      - "8443:443" # Change 8443 to your preferred port
```

After changing ports, update:
1. `.env` file (NEXT_PUBLIC_API_URL)
2. README.md
3. start.sh / start.bat scripts

## Why Custom Ports?

- **Port 80/443**: Often used by system services (IIS, Apache)
- **Port 3000/3001**: Commonly used by development servers
- **Port 5432**: May conflict with existing PostgreSQL installations
- **Port 6379**: May conflict with existing Redis installations

Using custom ports allows the platform to run alongside other services without conflicts.
