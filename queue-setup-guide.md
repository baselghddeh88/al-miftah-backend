# Queue Configuration for AlMiftah

## 1. Queue Driver Configuration

Edit `.env` file:

```env
QUEUE_CONNECTION=database
# Or use redis for better performance:
# QUEUE_CONNECTION=redis
# REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=null
# REDIS_PORT=6379
```

## 2. Create Queue Tables

Run migrations to create queue tables:

```bash
php artisan queue:table
php artisan queue:failed_table
php artisan migrate
```

## 3. Supervisor Configuration

### For Ubuntu/Debian (Laravel Forge, cPanel, etc.)

Create file: `/etc/supervisor/conf.d/almiftah-worker.conf`

```ini
[program:almiftah-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/site/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/almiftah-worker.log
stopwaitsecs=3600
```

### For CentOS/RHEL

Create file: `/etc/supervisord.d/almiftah-worker.ini`

```ini
[program:almiftah-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/site/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=apache
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/almiftah-worker.log
stopwaitsecs=3600
```

## 4. Apply Supervisor Configuration

```bash
# Stop supervisor
sudo supervisorctl stop all

# Reread configuration
sudo supervisorctl reread

# Update supervisor
sudo supervisorctl update

# Start workers
sudo supervisorctl start almiftah-worker:*

# Check status
sudo supervisorctl status
```

## 5. Queue Worker Commands

```bash
# Start worker (development)
php artisan queue:work

# Start worker with Redis (production)
php artisan queue:work redis --queue=default,notifications,emails

# Process single job (testing)
php artisan queue:work --once

# Process failed jobs
php artisan queue:retry all

# View failed jobs
php artisan queue:failed

# Clear failed jobs
php artisan queue:flush
```

## 6. For Multiple Queue Types

Update supervisor to handle different queues:

```ini
[program:almiftah-notifications]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/site/artisan queue:work database --queue=notifications,default --sleep=3 --tries=3
numprocs=2
autostart=true
autorestart=true
```

## 7. Memory Limits

For low memory servers:

```bash
php artisan queue:work --memory=128MB
```

## 8. Health Check Script

Create `/home/user/almiftah/scripts/health-check.sh`:

```bash
#!/bin/bash
if ! pgrep -f "queue:work" > /dev/null; then
    sudo supervisorctl start almiftah-worker:*
fi
```

Add to crontab:
```bash
* * * * * /home/user/almiftah/scripts/health-check.sh
```

## 9. Monitoring Commands

```bash
# Check queue length
php artisan queue:monitor database:default

# Monitor failed jobs
php artisan queue:monitor database:failed_jobs
```

## 10. Quick Setup Summary

```bash
# 1. Update .env
QUEUE_CONNECTION=database

# 2. Create tables
php artisan queue:table
php artisan migrate

# 3. Copy supervisor config
sudo cp almiftah-worker.conf /etc/supervisor/conf.d/

# 4. Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start almiftah-worker:*
```

## Troubleshooting

### Worker not starting
```bash
# Check logs
tail -f /var/log/almiftah-worker.log

# Check queue connection
php artisan queue:work --once --verbose
```

### Jobs not processing
```bash
# Check queue table
php artisan tinker
>>> Queue::size()
```

### Restart workers after code changes
```bash
sudo supervisorctl restart almiftah-worker:*
```
