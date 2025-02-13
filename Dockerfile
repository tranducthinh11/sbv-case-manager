# Bước 1: Build ứng dụng Angular
FROM node:20 AS build

# Đặt thư mục làm việc là /app
WORKDIR /app

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependency
RUN npm install --force

# Sao chép toàn bộ mã nguồn ứng dụng vào thư mục làm việc
COPY . .

# Build ứng dụng Angular cho môi trường staging
RUN npm run build --prod 

# Bước 2: Thiết lập Nginx để phục vụ ứng dụng Angular
FROM nginx:alpine

# Sao chép các tệp build từ bước 1 sang thư mục phục vụ của Nginx
COPY --from=build /app/dist/sbv-aml-creator/ /usr/share/nginx/html

# Sao chép file cấu hình Nginx tùy chỉnh (nếu có)
# COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose cổng 80 để có thể truy cập từ bên ngoài
EXPOSE 8088

# Chạy Nginx trong chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
