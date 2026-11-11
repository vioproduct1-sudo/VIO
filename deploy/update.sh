#!/bin/sh
# Build first, keep the existing data volume and retain the previous container.
set -eu
cd "$(dirname "$0")/.."
docker container inspect vio-tv >/dev/null 2>&1 || { echo 'Контейнер vio-tv не найден'; exit 1; }
volume=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Name}}{{end}}{{end}}' vio-tv)
[ "$volume" = 'vio-data' ] || { echo 'Нестандартное хранилище VIO. Обновление остановлено для сохранности данных.'; exit 1; }
docker build --pull -t vio-tv:update .
umask 077
envfile=$(mktemp)
trap 'rm -f "$envfile"' EXIT HUP INT TERM
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' vio-tv > "$envfile"
backup="vio-tv-backup-$(date +%Y%m%d-%H%M%S)"
docker stop vio-tv >/dev/null
docker rename vio-tv "$backup"
rollback(){ docker rm -f vio-tv >/dev/null 2>&1 || true; docker rename "$backup" vio-tv; docker start vio-tv >/dev/null; echo 'Возвращена предыдущая версия VIO. Данные сохранены.'; }
if ! docker run -d --name vio-tv --restart unless-stopped --security-opt no-new-privileges:true -p 8088:8080 -v vio-data:/app/data --env-file "$envfile" vio-tv:update; then rollback; exit 1; fi
count=0
while [ "$count" -lt 20 ]; do
 if docker exec vio-tv node -e "fetch('http://127.0.0.1:8080/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" >/dev/null 2>&1; then
  echo 'VIO обновлён. Плейлист, EPG и пароль сохранены.'
  echo 'В MSX: Settings → Start Parameter → Setup → 192.168.8.222:8088'
  echo "Резервный контейнер: $backup"
  exit 0
 fi
 count=$((count+1));sleep 2
done
echo 'Новая версия не прошла проверку запуска.';rollback;exit 1
