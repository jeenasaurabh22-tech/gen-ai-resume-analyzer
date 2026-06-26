FROM node:20-alpine AS frontend-builder
COPY ./Frontend /app
COPY ./Frontend/.env.production /app/.env.production
WORKDIR /app
RUN npm install
RUN NODE_ENV=production npm run build

FROM node:20-alpine AS backend-builder
COPY ./Backend /app
WORKDIR /app
RUN npm install
COPY --from=frontend-builder /app/dist /app/public
CMD ["npm", "run", "dev"]

