# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_USE_MOCK=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK

# Run production build
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
