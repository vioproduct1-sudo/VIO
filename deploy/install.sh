#!/bin/sh
# Run from the extracted VIO package on the NAS. No password is supplied here.
set -eu
cd "$(dirname "$0")/.."
command -v docker >/dev/null 2>&1 || { echo 'Docker Engine не найден'; exit 1; }
docker info >/dev/null 2>&1 || { echo 'Нет доступа к Docker. Запустите от пользователя с правами Docker.'; exit 1; }
if docker container inspect vio-tv >/dev/null 2>&1; then
 echo 'Контейнер vio-tv уже существует. Для обновления используйте Docker Compose; данные не изменены.'
 exit 1
fi
printf 'Создайте пароль администратора VIO (минимум 8 символов): '
stty -echo
trap 'stty echo 2>/dev/null || true; unset VIO_ADMIN_PASSWORD' EXIT HUP INT TERM
IFS= read -r VIO_ADMIN_PASSWORD
stty echo
printf '\n'
[ "${#VIO_ADMIN_PASSWORD}" -ge 8 ] || { echo 'Слишком короткий пароль'; exit 1; }
export VIO_ADMIN_PASSWORD
docker build --pull -t vio-tv:local .
docker volume create vio-data >/dev/null
docker run -d --name vio-tv --restart unless-stopped --security-opt no-new-privileges:true \
 -p 8088:8080 -v vio-data:/app/data \
 --env VIO_ADMIN_PASSWORD --env PUBLIC_URL=http://192.168.8.222:8088 vio-tv:local
unset VIO_ADMIN_PASSWORD
echo 'VIO запущен: http://192.168.8.222:8088'
echo 'Откройте Администратор и подключите свой M3U и XMLTV EPG.'
echo 'Проверка: docker logs vio-tv'
