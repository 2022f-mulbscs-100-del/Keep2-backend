FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev
# -omit=dev → skip devDependencies, only install dependencies needed to run the app.
# Dev dependencies (like eslint, nodemon, vite, jest) are not

COPY . .

EXPOSE 2404

CMD ["node", "index.js"]



# # Navigate to backend folder
# cd ./keep-backend

# # Build the image
# docker build -t keep-backend:latest .

# # Run the container
# docker run -d \
#   --name backend_service \
#   --network app_network \
#   -p 2404:2404 \
#   -e NODE_ENV=production \
#   -e DATABASE=db \
#   -e DB_USER=root \
#   -e PASSWORD=root \
#   -e REDIS_URL=redis://redis:6379 \
#   keep-backend:latest





# docker run -d \
#   --name db_service \
#   --network app_network \
#   -p 3306:3306 \
#   -e MYSQL_ROOT_PASSWORD=root \
#   -e MYSQL_DATABASE=db \
#   -v mysql_data:/var/lib/mysql \
#   mysql:8.0

# -v mysql_data:/var/lib/mysql persists DB data in a volume.

# Redis
# docker run -d \
#   --name redis_service \
#   --network app_network \
#   -p 6379:6379 \
#   redis:latest