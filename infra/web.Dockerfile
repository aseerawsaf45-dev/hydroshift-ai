FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.10.1 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install

COPY . .

ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/apps/web

CMD ["pnpm", "dev", "--hostname", "0.0.0.0", "--port", "3000"]

