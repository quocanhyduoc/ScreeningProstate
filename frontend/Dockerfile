FROM node:18-alpine AS builder
# Cài đặt libc6-compat cho alpine (bắt buộc đối với bộ biên dịch SWC của Next.js)
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
# Không chạy bằng quyền root để bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Sao chép các tệp tĩnh và cấu hình độc lập
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]