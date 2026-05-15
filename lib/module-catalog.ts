export const FREE_MODULE_MAX = 2;

export const FREE_MODULE_INFO: Record<string, { label: string; description: string; limitNote: string }> = {
  turnera: { label: "Bookings",     description: "Turnera digital y agenda online",     limitNote: "50 reservas/mes · 5 servicios" },
  catalog: { label: "Catálogo",     description: "Productos y tienda pública con QR",   limitNote: "10 productos activos"          },
  stock:   { label: "Stock",        description: "Control de inventario y movimientos", limitNote: "10 ítems en stock"             },
  caja:    { label: "Caja Digital", description: "Registro de ingresos y egresos",      limitNote: "Sin límite de movimientos"     },
  orders:  { label: "Pedidos",      description: "Gestión de pedidos y ventas",         limitNote: "50 pedidos/mes"                },
};
