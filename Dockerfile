FROM node:22-alpine

# ffmpeg merges the recordings, openssl is needed by Prisma's query engine
RUN apk add --no-cache ffmpeg openssl

WORKDIR /Backend

COPY Backend/package*.json ./
RUN npm ci

COPY Backend/ .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Apply pending migrations, then start the API. The worker service overrides this command.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
