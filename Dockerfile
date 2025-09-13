FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Add build arg and env var
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
RUN npm run build
RUN npm prune --production

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
# Pass the env var to runtime as well
ENV PUBLIC_API_URL=$PUBLIC_API_URL
CMD [ "node", "build" ]
