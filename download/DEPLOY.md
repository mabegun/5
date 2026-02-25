# Инструкция по деплою Проектное Бюро

## Сервер: 45.12.73.205 (Ubuntu 24.04)

### Шаг 1: Подключение к серверу

```bash
ssh root@45.12.73.205
```

### Шаг 2: Установка Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # Должно показать v20.x.x
```

### Шаг 3: Установка PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### Шаг 4: Настройка базы данных

```bash
sudo -u postgres psql << 'EOF'
CREATE DATABASE projectbureau;
CREATE USER pbuser WITH PASSWORD 'PBUre2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE projectbureau TO pbuser;
ALTER DATABASE projectbureau OWNER TO pbuser;
\q
EOF
```

### Шаг 5: Установка PM2

```bash
npm install -g pm2
```

### Шаг 6: Создание директории проекта

```bash
mkdir -p /var/www/projectbureau
mkdir -p /var/www/projectbureau/uploads
chown -R www-data:www-data /var/www/projectbureau
```

### Шаг 7: Установка Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Шаг 8: Копирование проекта на сервер

На локальной машине (в папке проекта):
```bash
# Упаковываем проект
tar -czvf projectbureau.tar.gz .

# Копируем на сервер
scp projectbureau.tar.gz root@45.12.73.205:/var/www/projectbureau/
```

На сервере:
```bash
cd /var/www/projectbureau
tar -xzvf projectbureau.tar.gz
rm projectbureau.tar.gz
```

### Шаг 9: Установка зависимостей и сборка

```bash
cd /var/www/projectbureau

# Устанавливаем зависимости
npm install

# Генерируем Prisma клиент
npx prisma generate

# Создаем таблицы в БД
npx prisma db push

# Заполняем начальными данными
npm run db:seed

# Собираем проект
npm run build
```

### Шаг 10: Настройка переменных окружения

```bash
cat > /var/www/projectbureau/.env << 'EOF'
DATABASE_URL="postgresql://pbuser:PBUre2024!Secure@localhost:5432/projectbureau?schema=public"
JWT_SECRET="project-bureau-super-secret-jwt-key-2024-very-secure-change-this"
NEXT_PUBLIC_APP_URL="http://45.12.73.205"
UPLOAD_DIR="/var/www/projectbureau/uploads"
NODE_ENV="production"
EOF
```

### Шаг 11: Запуск через PM2

```bash
cd /var/www/projectbureau
pm2 start npm --name "projectbureau" -- start
pm2 save
pm2 startup
```

### Шаг 12: Настройка Nginx

```bash
cat > /etc/nginx/sites-available/projectbureau << 'EOF'
server {
    listen 80;
    server_name 45.12.73.205;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        client_max_body_size 50M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/projectbureau /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### Шаг 13: Проверка

Откройте в браузере: http://45.12.73.205

**Демо аккаунты:**
- Администратор: admin@test.com / admin123
- ГИП: gip@test.com / gip123
- Исполнитель: emp@test.com / emp123

---

## Полезные команды

### Просмотр логов
```bash
pm2 logs projectbureau
```

### Перезапуск приложения
```bash
pm2 restart projectbureau
```

### Обновление проекта
```bash
cd /var/www/projectbureau
git pull  # или загрузить новые файлы
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart projectbureau
```

### SSL сертификат (опционально)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## Структура базы данных

- **users** - Пользователи (админы, ГИПы, исполнители)
- **projects** - Проекты
- **sections** - Разделы проектов
- **investigations** - Изыскания
- **standard_investigations** - Справочник изысканий
- **expertises** - Экспертизы
- **expertise_remarks** - Замечания экспертизы
- **contacts** - Контактные лица
- **intro_blocks** - Вводная информация
- **tasks** - Задачи
- **messages** - Сообщения
- **notifications** - Уведомления
- **files** - Файлы
