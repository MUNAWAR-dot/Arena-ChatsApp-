# Chatsapp Server — Fastify + Socket.IO + Prisma

## Quick start

```bash
cd server
npm install
cp .env.example .env          # set DATABASE_URL
npx prisma migrate dev        # create schema
npm run dev                   # starts on :3001
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | tsx watch server |
| `npm run build` | tsc compile to dist/ |
| `npm start` | run compiled server |
| `npm run prisma:generate` | regenerate Prisma client |
| `npm run prisma:migrate` | create/apply dev migration |
| `npm run prisma:deploy` | apply migrations in production |

## Environment variables

See `.env.example` — `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `SMS_SIMULATION_DELIVERY`.

## API surface

- `POST /auth/otp` — request OTP (rate limited 5/10min)
- `POST /auth/verify` — verify OTP → user + session (token, refresh)
- `POST /auth/session` — refresh a session
- `DELETE /auth/session` — revoke session(s)
- `POST /contacts` — add contact by phone
- `POST /messages` — create message (persist + relay via Socket.IO room)
- `GET /chats` — list user chats
- `GET /chats/:id/messages` — message history (paginated by createdAt)

## Realtime protocol (Socket.IO)

Auth handshake: `socket.handshake.auth.token` (session token).

| Event | Direction | Payload |
| --- | --- | --- |
| `chat:join` | client→server | `string[]` chatIds |
| `message:send` | client→server | `{clientId, chatId, text, type, envelope?, mediaId?}` → ack `{message}` |
| `message:new` | server→room | `{chatId, message}` (only other clients) |
| `message:status` | both | `{chatId, messageId, status: DELIVERED\|READ}` |
| `typing` | both | `{chatId, userId, action}` |
| `presence` | both | `{userId, online}` |

Messages are persisted with Prisma **before** relay; the server never generates messages.
