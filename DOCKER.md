# Docker Configuration Guide

## DOCKER_HOST Environment Variable

`DOCKER_HOST` tells the Docker client where to find the Docker daemon. In most cases, you **don't need to set it** because Docker uses sensible defaults.

### Default Values (No Configuration Needed)

**macOS / Linux:**
- Default: `unix:///var/run/docker.sock`
- Docker Desktop automatically handles this
- **You typically don't need to set DOCKER_HOST**

**Windows:**
- Default: `npipe:////./pipe/docker_engine`
- Docker Desktop automatically handles this
- **You typically don't need to set DOCKER_HOST**

### When You Might Need to Set DOCKER_HOST

Only set `DOCKER_HOST` if you're in one of these scenarios:

#### 1. Remote Docker Daemon
If you're connecting to a Docker daemon on a remote machine:

```bash
# For remote Docker (insecure, not recommended for production)
export DOCKER_HOST=tcp://remote-host:2375

# For remote Docker with TLS (recommended)
export DOCKER_HOST=tcp://remote-host:2376
export DOCKER_TLS_VERIFY=1
export DOCKER_CERT_PATH=/path/to/certs
```

#### 2. Custom Docker Socket Location
If your Docker socket is in a non-standard location:

```bash
# Linux/macOS
export DOCKER_HOST=unix:///custom/path/docker.sock

# Windows
export DOCKER_HOST=npipe:////./pipe/custom_docker_engine
```

#### 3. Docker-in-Docker or Special Setups
If you're running Docker inside Docker or using special virtualization:

```bash
# Example: Using a different socket
export DOCKER_HOST=unix:///var/run/docker.sock
```

### For This Project

**You don't need to set DOCKER_HOST** for this URL shortener project. The default Docker setup works fine.

Just make sure:
1. Docker Desktop is running (or Docker daemon is running on Linux)
2. You can run `docker ps` successfully
3. Then use `docker-compose up -d` or `make db-up`

### Verify Docker is Working

Check if Docker is accessible:

```bash
# This should work without setting DOCKER_HOST
docker ps

# If this works, you're all set!
docker-compose version
```

### Troubleshooting

If `docker-compose` fails with connection errors:

1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **On macOS/Windows:** Make sure Docker Desktop is running

3. **On Linux:** Make sure Docker daemon is running:
   ```bash
   sudo systemctl status docker
   ```

4. **Check current DOCKER_HOST:**
   ```bash
   echo $DOCKER_HOST
   # If it's set incorrectly, unset it:
   unset DOCKER_HOST
   ```

5. **Check Docker socket permissions (Linux):**
   ```bash
   ls -la /var/run/docker.sock
   # You might need to add your user to docker group:
   sudo usermod -aG docker $USER
   ```

### Summary

- **For local development:** Don't set `DOCKER_HOST` - use defaults
- **For this project:** No `DOCKER_HOST` configuration needed
- **Only set it if:** You're using remote Docker or special setups

