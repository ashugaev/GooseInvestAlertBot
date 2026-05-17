FROM node:20-bullseye-slim

WORKDIR /app

# Copy manifests first to maximise Docker layer cache reuse.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]
