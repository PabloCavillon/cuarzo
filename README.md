# Cuarzo

SaaS multi-tenant para PYMEs argentinas: turnos, stock, pedidos, caja, facturación ARCA y suscripciones.

Next.js, Prisma y Postgres en Vercel. El código está en `apps/web`.

## Desarrollo

```bash
npm install
npm run dev
npm run test:run --workspace=apps/web
```

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Base de datos |
| `AUTH_SECRET` | Firma sesiones y cookies de 2FA |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login con Google |
| `RESEND_API_KEY` | Mails, incluido el formulario de contacto |
| `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` | Suscripciones |
| `AFIP_KEY_SECRET` | Cifra la clave privada de AFIP de cada negocio |
| `SUPER_ADMIN_TOTP_SECRET` | Segundo factor del super admin |
| `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Notificaciones push (opcionales) |

Documentos de producto y diseño: `PRODUCT.md` y `DESIGN.md`.
