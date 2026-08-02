# Tahap 1: Build Image berbasiskan Node V22 (Sesuai environment lokal)
FROM node:22-alpine as builder

WORKDIR /app

# Install dependency dependencies terlebih dahulu
COPY package*.json ./
RUN npm install

# Copy seluruh source code
COPY . .

# Environment Variabel harus dimasukkan saat Build Time pada React Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Jalankan vite build
RUN npm run build

# Tahap 2: Runtime Image menggunakan Nginx super ringan
FROM nginx:alpine

# Copy hasil rajutan folder 'dist' ke public Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Buat blok konfigurasi khusus SPA (Single Page Application) React Router Dom
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Ubah konfigurasi "Listen 80" menjadi mendengarkan PORT publik Railway pada Runtime
CMD sed -i -e 's/listen 80;/listen '"${PORT:-80}"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
