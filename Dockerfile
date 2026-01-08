FROM node:24.12.0

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]