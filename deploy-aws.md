# AWS Free Tier Deployment Guide

## Prerequisites
- AWS account (free tier)
- SSH client (PowerShell has `ssh` built-in on Win10/11)

---

## Step 1 — Launch EC2 Instance (t2.micro)

1. Go to **AWS Console > EC2 > Launch Instance**
2. Configure:
   - **Name:** `hospital-backend`
   - **AMI:** Amazon Linux 2023 (free tier eligible)
   - **Architecture:** 64-bit (x86)
   - **Instance type:** `t2.micro` (free tier)
   - **Key pair:** Create new `hospital-key.pem` → download & save it
   - **Network settings:** Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (5000)
   - **Storage:** 8 GB gp2 (free tier)
3. Click **Launch Instance**

---

## Step 2 — SSH Into the Instance

```powershell
# From your machine
ssh -i "C:\path\to\hospital-key.pem" ec2-user@<PUBLIC_IP>
```

> ⚠️ On Windows: you may need to run `icacls "C:\path\to\hospital-key.pem" /inheritance:r /grant "%USERNAME%:R"` first for proper permissions.

---

## Step 3 — Install Docker & Docker Compose

```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

**Log out and back in** (`exit` then reconnect SSH) for group changes to take effect.

Install Docker Compose plugin:
```bash
sudo yum install -y docker-compose-plugin
docker compose version
```

---

## Step 4 — Deploy the Application

### Option A — From GitHub (recommended for CI/CD later)

```bash
# Clone your repo
git clone <YOUR_REPO_URL> hospital
cd hospital

# Create .env file with production secrets
cat > .env << 'EOF'
JWT_SECRET=<generate-a-random-64-char-string>
EOF

# Start all services
docker compose up -d

# Run migrations & seed
docker exec hospital-backend npx --yes sequelize-cli db:migrate
docker exec hospital-backend npx --yes sequelize-cli db:seed:all
```

### Option B — From local machine (scp files)

```powershell
# From your local PowerShell
scp -i "C:\path\to\hospital-key.pem" -r "D:\Hospital-Managment-System\backend" ec2-user@<PUBLIC_IP>:/home/ec2-user/
scp -i "C:\path\to\hospital-key.pem" "D:\Hospital-Managment-System\docker-compose.yml" ec2-user@<PUBLIC_IP>:/home/ec2-user/
```

Then SSH and run:
```bash
cd /home/ec2-user
JWT_SECRET=<random-string> docker compose up -d
```

---

## Step 5 — Configure Security Group

Back in AWS Console > EC2 > Security Groups, edit inbound rules for your instance:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP | Admin access |
| Custom TCP | 5000 | 0.0.0.0/0 | API access |
| HTTP | 80 | 0.0.0.0/0 | Future (Nginx reverse proxy) |
| HTTPS | 443 | 0.0.0.0/0 | Future (SSL) |

---

## Step 6 — Verify Deployment

```bash
curl http://localhost:5000/api/v1/health
curl -X POST http://<PUBLIC_IP>:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"Admin@123"}'
```

---

## Step 7 — (Optional) Add a Reverse Proxy with Nginx

```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Create `/etc/nginx/conf.d/hospital.conf`:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo systemctl restart nginx
```

Now your API is accessible on port 80 (no need for `:5000` in the URL).

---

## Cost Summary (Free Tier)

| Service | Free Tier Limit | Our Usage |
|---------|----------------|-----------|
| EC2 t2.micro | 750 hrs/month | 1 instance ✅ |
| EBS gp2 | 30 GB | 8 GB ✅ |
| Data transfer | 100 GB out | Minimal ✅ |
| ECR | 500 MB | ~330 MB ✅ |

**Estimated monthly cost: $0**

---

## Clean Up

To avoid unexpected charges:
```bash
# SSH into instance
docker compose down -v
# Terminate instance in AWS Console
```
