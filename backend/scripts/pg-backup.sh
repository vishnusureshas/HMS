#!/bin/bash
# Database backup script for EC2
# Usage: DB_HOST=<host> DB_USER=<user> DB_NAME=<name> DB_PASSWORD=<pass> ./pg-backup.sh

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/tmp
S3_BUCKET=${S3_BACKUP_BUCKET:-hospital-backups}
S3_PREFIX=${S3_BACKUP_PREFIX:-postgres}

export PGPASSWORD=$DB_PASSWORD
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup-$TIMESTAMP.sql.gz

aws s3 cp $BACKUP_DIR/backup-$TIMESTAMP.sql.gz s3://$S3_BUCKET/$S3_PREFIX/

# Remove local backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup complete: s3://$S3_BUCKET/$S3_PREFIX/backup-$TIMESTAMP.sql.gz"
