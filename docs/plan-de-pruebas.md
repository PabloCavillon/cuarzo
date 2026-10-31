# Plan de pruebas de Cuarzo

Seguilo en orden: cada bloque deja listos los datos o las credenciales del siguiente.
Marcá cada casilla al probarla. Si algo falla, anotá URL, usuario y qué esperabas ver.

## 0. Preparación

Usá una base de pruebas, por ejemplo una rama de Neon. No uses la de producción: el seed crea un negocio demo con un super admin.

- [ ] En `apps/web/.env`, cargar `DATABASE_URL`, `AUTH_SECRET`, `AFIP_KEY_SECRET` y `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` (`http://localhost:3000`).
- [ ] Crear las tablas: `npx prisma db push`, desde `apps/web`.
- [ ] Cargar los datos: `SEED_PASSWORD=<una contraseña larga> npx prisma db seed`. En una base remota es obligatoria; en `localhost` no.
- [ ] Levantar la app: `npm run dev`.

| Credencial | Hace falta para | Sin ella |
|---|---|---|
| `RESEND_API_KEY` | Contacto, verificación de email, recuperar contraseña, invitaciones, 2FA por email | No salen los emails |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login con Google | Bloque 2 incompleto |
| `SUPER_ADMIN_TOTP_SECRET` | Panel de super admin (se obtiene en `/super-admin/setup`) | Bloque 12 bloqueado |
| `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_WEBHOOK_SECRET` (sandbox) | Suscripción y webhook | Bloque 10 incompleto |
| Certificado de homologación de AFIP | Emitir facturas | Bloque 9 incompleto |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y su clave privada | Notificaciones push | Bloque 11 incompleto |

### Usuarios

| Rol | Email | Contraseña en local | Contraseña en base remota |
|---|---|---|---|
| Dueño y super admin | `admin@cuarzo.dev` | `admin123` | `SEED_PASSWORD` |
| Admin | `manager@cuarzo.dev` | `admin456` | `SEED_PASSWORD` |
| Staff | `staff@cuarzo.dev` | `staff123` | `SEED_PASSWORD` |

El negocio demo tiene slug `demo`, plan Pro y los siete módulos activos.
El dueño también es super admin y saltea los controles de rol: los permisos se prueban siempre con admin y staff.

## 1. Sitio público

- [ ] Landing en escritorio: el cristal gira, se arrastra y no tiene anillo alrededor.
- [ ] Landing en celular: el scroll no se traba sobre el cristal y nada se sale de la pantalla.
- [ ] Con movimiento reducido activado en el sistema, el cristal queda quieto.
- [ ] Todos los enlaces del menú y del pie llevan al lugar correcto.
- [ ] Los planes coinciden con `/admin/subscription`.
- [ ] Contacto: el mensaje llega a `dev@cuarzostudio.com`.
- [ ] Contacto: datos vacíos o email inválido muestran error; un nombre con `<b>` llega como texto.
- [ ] El enlace de WhatsApp abre un chat con 11 6656-5670, en celular y en escritorio.
- [ ] `/cv` carga.

## 2. Cuentas y acceso

- [ ] Registrar un negocio nuevo con un email real.
- [ ] Sin verificar el email, no se puede entrar a `/admin`.
- [ ] Un código de verificación incorrecto cinco veces invalida el código.
- [ ] Reenviar código y verificar: entra al onboarding.
- [ ] Completar el onboarding; no se pueden elegir más módulos que los del plan gratis.
- [ ] Login con contraseña incorrecta: error sin revelar si el email existe.
- [ ] Recuperar contraseña: llega el email y el enlace funciona una sola vez.
- [ ] Después del cambio, una sesión abierta en otro navegador queda cerrada.
- [ ] Google con un email nuevo crea un negocio propio.
- [ ] Google con un email existente no verificado borra la contraseña anterior y conserva la cuenta.
- [ ] Un usuario desactivado no puede entrar.
- [ ] Cerrar sesión: `/admin` vuelve a pedir login.

## 3. Dos pasos (2FA)

- [ ] Activar 2FA con app autenticadora en Ajustes.
- [ ] Cerrar sesión y entrar: pide código en `/2fa`, y `/admin` no abre sin pasarlo.
- [ ] Un código incorrecto da error.
- [ ] Repetir con 2FA por email.
- [ ] Desactivar 2FA.

## 4. Equipo y permisos

Repetí cada fila como admin y como staff.

- [ ] `/admin/settings`: el staff no puede cambiar datos del negocio.
- [ ] `/admin/settings/audit`: el admin ve el registro y el staff no. **Revisar:** hoy el staff termina en `/login` aunque tenga sesión.
- [ ] `/admin/onboarding`: **revisar** lo mismo; admin y staff terminan en `/login`.
- [ ] `/admin/subscription`: solo el dueño puede cambiar o cancelar el plan. **Revisar:** admin y staff pueden abrir la página.
- [ ] `/admin/billing/settings`: solo dueño y admin guardan. **Revisar:** el staff puede abrir la página.
- [ ] `/admin/finance` y `/admin/reports`: decidir si el staff debe ver dinero. Hoy puede abrir ambas.
- [ ] Invitar a un usuario: llega el email y al aceptar queda en el negocio con el rol elegido.
- [ ] Reabrir una invitación ya usada: rechazada.
- [ ] Cambiar el rol de un usuario y desactivarlo: el efecto es inmediato, sin volver a entrar.

## 5. Turnos

- [ ] Crear, editar y desactivar servicios en `/admin/appointments/services`.
- [ ] En `/appointments/demo`, reservar paso a paso: llega la confirmación con código.
- [ ] Un servicio desactivado no aparece.
- [ ] Dos navegadores reservan el mismo horario a la vez: solo uno lo consigue.
- [ ] Reservar a más de 60 días: rechazado.
- [ ] Probar días y horarios no laborables.
- [ ] `/appointments/my-bookings`: el código encuentra la reserva y un email no.
- [ ] En `/admin/appointments`: ver detalle, confirmar, cancelar y marcar ausente.
- [ ] El horario cancelado vuelve a estar disponible.
- [ ] La lista filtra por fecha y estado, y el calendario muestra lo correcto.

## 6. Catálogo y tienda

- [ ] Crear, editar y borrar categorías; probar borrar una con productos.
- [ ] Crear, editar y desactivar productos, con y sin variantes.
- [ ] Probar SKU repetido, precio cero y precio negativo.
- [ ] `/store/demo` muestra los productos activos y no los inactivos.
- [ ] Abrir la ficha de un producto y comprobar precio y variantes.

## 7. Stock y pedidos

- [ ] Crear, editar y borrar depósitos.
- [ ] Hacer un ajuste de stock y verlo en `/admin/stock/movements`.
- [ ] Transferir entre depósitos si la pantalla lo permite.
- [ ] Las alertas muestran los cuatro productos bajo mínimo.
- [ ] Crear un pedido en `/admin/orders/new`.
- [ ] Probar pedir más stock del disponible.
- [ ] Recorrer los estados: borrador, confirmado, en proceso, enviado y entregado.
- [ ] Al confirmar, el stock baja.
- [ ] Al cancelar un pedido confirmado, el stock vuelve con motivo `adjustment`.
- [ ] Dos pestañas confirman el mismo pedido: el stock baja una sola vez.
- [ ] Registrar pagos en efectivo, por transferencia y con Mercado Pago.

## 8. Clientes, proveedores, caja, tareas, reportes y soporte

- [ ] `/admin/customers`: crear, editar, buscar y abrir un cliente con historial.
- [ ] `/admin/providers`: crear, editar y borrar proveedores. `/admin/customers/suppliers` redirige acá.
- [ ] `/admin/finance`: cargar ingresos y egresos; los totales cierran.
- [ ] `/admin/tasks`: crear, asignar, cambiar estado y borrar.
- [ ] Tarea recurrente: al completarla se crea la siguiente con la fecha correcta.
- [ ] `/admin/reports`: comparar totales con pedidos y caja; cambiar el período.
- [ ] Exportar a CSV: el archivo abre bien en Excel, con acentos.
- [ ] Un cliente llamado `=SUMA(1;1)` no se ejecuta como fórmula al abrir el CSV.
- [ ] `/admin/tickets`: crear un ticket y responderlo. Se termina de probar en el bloque 12.
- [ ] El dashboard `/admin` coincide con los datos reales.

## 9. Facturación AFIP (homologación)

- [ ] `/admin/billing/settings`: cargar CUIT, punto de venta, certificado y clave con entorno de pruebas. El seed trae un CUIT de ejemplo que AFIP va a rechazar.
- [ ] Al reabrir la pantalla, la clave privada no se muestra.
- [ ] En la base, la clave guardada empieza con `enc:v1:`.
- [ ] Emitir Factura A a un Responsable Inscripto.
- [ ] Emitir Factura B a consumidor final y Factura C desde un monotributista.
- [ ] Probar alícuotas de IVA distintas.
- [ ] El CAE y el número quedan guardados, y dos facturas seguidas no repiten número.
- [ ] Con certificado inválido, el error es entendible y no queda una factura a medias.
- [ ] Facturar desde un pedido, si corresponde.
- [ ] Verificar que AFIP acepte `CondicionIVAReceptorId`. Quedó sin comprobar.

## 10. Suscripción y Mercado Pago (sandbox)

Usá un negocio de plan Free y un túnel público, por ejemplo cloudflared, para recibir el webhook.

- [ ] Elegir un plan pago: abre el checkout de Mercado Pago.
- [ ] Pagar con tarjeta de prueba: el webhook llega y el plan del negocio cambia.
- [ ] Los límites nuevos se aplican: usuarios, productos y turnos.
- [ ] Un pago rechazado no cambia el plan.
- [ ] Un webhook con firma incorrecta se rechaza.
- [ ] Cancelar: el negocio vuelve a Free.
- [ ] En Free, comprobar cada tope: 50 turnos por mes, 10 productos y 1 usuario.

## 11. Notificaciones

- [ ] Activar notificaciones en el panel y aceptar el permiso del navegador.
- [ ] Una reserva nueva dispara la notificación.
- [ ] Desactivarlas: dejan de llegar.

## 12. Super admin

- [ ] Configurar `/super-admin/setup` y entrar por `/super-admin/login` con el código.
- [ ] Sin el código, `/super-admin` no abre, aunque el usuario sea `superAdmin`.
- [ ] Admin y staff no pueden entrar.
- [ ] Ver un negocio ajeno y salir de esa vista: los datos vuelven a los propios.
- [ ] Resetear la contraseña de un usuario de otro negocio.
- [ ] Responder y cerrar el ticket del bloque 8: el negocio ve la respuesta.

## 13. Aislamiento entre negocios

Hacelo con el negocio del bloque 2 y el demo abiertos en navegadores distintos.

- [ ] Abrir la URL de un pedido, cliente o turno del otro negocio: da error o no encontrado.
- [ ] Repetir con las APIs de tareas y tickets, cambiando el id a mano.
- [ ] Listas, reportes y exportes no muestran datos ajenos.

## 14. Salida a producción

- [ ] `npm run test:run`, `npx tsc --noEmit` y `npm run build` pasan.
- [ ] `npx playwright test`. Los e2e no se corrieron después de los últimos cambios.
- [ ] Vercel tiene todas las variables de la sección 0, con `AFIP_KEY_SECRET` guardada en un gestor de contraseñas.
- [ ] Revisar cabeceras de seguridad y que el límite de pedidos funcione: solo corre en producción.
- [ ] Probar registro, login, reserva y contacto en la URL real.
- [ ] Probar en Chrome, Safari y un celular real.
