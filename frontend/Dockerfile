FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

# Vite bakes VITE_* variables into the bundle at build time, so they are build args.
# Args that are passed override the values in frontend/.env; args left unset are
# not exported, so the .env value is used.
ARG VITE_BACKEND_URL
ARG VITE_LIVEKIT_WSURL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
