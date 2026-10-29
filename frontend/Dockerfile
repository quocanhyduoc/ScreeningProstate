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

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Bảo mật: Không chạy bằng quyền root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Tạo thư mục cache cho Next.js với quyền phù hợp
RUN mkdir -p .next
RUN chown -R nextjs:nodejs .next

# Sao chép các tệp tĩnh và standalone bundle với đúng quyền user nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]