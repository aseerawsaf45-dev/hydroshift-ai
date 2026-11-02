FROM node:20-slim

WORKDIR /app

# Install pnpm directly via npm to avoid corepack runtime shims and exit 127
RUN npm install -g pnpm@12.10.1

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install

COPY . .

ENV NEXT_PUBLIC_API_BASE_URL=https://swot-khulna-api.onrender.com
ENV PORT=3000
EXPOSE 3000

RUN pnpm --filter web build

WORKDIR /app/apps/web

CMD ["pnpm", "start", "--port", "3000"]
