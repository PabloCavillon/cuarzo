export const locales = ["es", "en", "pt"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

// ─── Translation shape ────────────────────────────────────────────────────────
// Explicit type so all three locale objects are structurally validated without
// locking literal string values (which `as const` would do).

export type T = {
  nav: { services: string; custom: string; whyUs: string; pricing: string; contact: string; start: string; login: string };
  hero: {
    heading1: string; heading2: string; heading3: string;
    description: string; ctaPrimary: string; ctaSecondary: string;
  };
  services: {
    heading: string; description: string; cta: string;
    items: { title: string; description: string }[];
  };
  values: {
    heading: string; description: string;
    items: { title: string; description: string }[];
  };
  contact: {
    heading: string; description: string;
    emailLabel: string; locationLabel: string; locationValue: string;
    fields: {
      name: string; email: string; company: string; message: string;
      namePlaceholder: string; emailPlaceholder: string;
      companyPlaceholder: string; messagePlaceholder: string;
    };
    submit: string; sending: string; error: string;
    success: { heading: string; description: string };
  };
  footer: {
    tagline: string; productHeading: string; companyHeading: string;
    productLinks: string[]; companyLinks: string[];
    copyright: (year: number) => string; location: string;
  };
  pricing: {
    heading: string;
    description: string;
    cta: string;
    ctaFree: string;
    popular: string;
    disclaimer: string;
    plans: {
      name: string;
      price: string;
      period: string;
      features: string[];
    }[];
  };
  customWork: {
    heading: string;
    description: string;
    cta: string;
    items: { title: string; description: string; tags: string[] }[];
  };
  whyCuarzo: {
    heading: string;
    body1: string;
    body2: string;
    closing: string;
  };
  auth: {
    login: {
      title: string; emailLabel: string; emailPlaceholder: string;
      passwordLabel: string; passwordPlaceholder: string;
      submit: string; loading: string; google: string;
      noAccount: string; registerLink: string; error: string;
    };
    register: {
      title: string;
      businessNameLabel: string; businessNamePlaceholder: string;
      nameLabel: string; namePlaceholder: string;
      emailLabel: string; emailPlaceholder: string;
      passwordLabel: string; passwordPlaceholder: string;
      confirmLabel: string; confirmPlaceholder: string;
      submit: string; loading: string; google: string;
      hasAccount: string; loginLink: string;
      errors: { passwordMismatch: string; passwordShort: string; generic: string; loginFail: string };
    };
  };
  admin: {
    nav: {
      dashboard: string; appointments: string; catalog: string; stock: string;
      orders: string; billing: string; finance: string; tasks: string;
      reports: string; customers: string; subscription: string;
      support: string; settings: string; providers: string;
    };
    common: {
      signOut: string; stopViewing: string; exitView: string;
      cancel: string; save: string; create: string; edit: string;
      search: string; showInactive: string; noResults: string;
    };
  };
  turnera: {
    layout: { myBookings: string };
    page: { title: string; description: string };
    check: {
      title: string; description: string; newBooking: string;
      emailPlaceholder: string; submit: string; loading: string;
      networkError: string; noResults: string; noResultsHint: string;
      resultCount: (n: number) => string;
      past: string; confirmed: string; cancelled: string; min: string; hs: string;
    };
    wizard: {
      steps: { service: string; date: string; time: string; info: string };
      step1: { title: string; description: string; free: string; loading: string; payLater: string; min: string };
      step2: { title: string; description: string };
      step3: { title: string; subtitle: (service: string, min: number) => string; takenSlots: string };
      step4: {
        title: string; description: string;
        nameLabel: string; namePlaceholder: string;
        emailLabel: string; emailPlaceholder: string;
        phoneLabel: string; phonePlaceholder: string;
        notesLabel: string; notesPlaceholder: string;
      };
      step5: {
        title: string; sentTo: (email: string) => string;
        serviceLabel: string; durationLabel: string; dateLabel: string; timeLabel: string;
        nameLabel: string; emailLabel: string; notesLabel: string;
        min: string; hs: string; calendar: string; back: string;
      };
      nav: { prev: string; next: string; confirm: string; confirming: string };
      errors: { loadFail: string; bookFail: string };
    };
  };
};

const es: T = {
  nav: {
    services: "Servicios",
    custom: "A medida",
    whyUs: "Por qué elegirnos",
    pricing: "Precios",
    contact: "Contacto",
    start: "Empezar",
    login: "Iniciar sesión",
  },
  hero: {
    heading1: "Stock, turnos",
    heading2: "y facturación",
    heading3: "en un solo lugar",
    description:
      "La plataforma para PYMEs argentinas: controlá tu stock, recibí reservas online, facturá con ARCA y vendé por internet.",
    ctaPrimary: "Empezar gratis",
    ctaSecondary: "Necesito un desarrollo a medida",
  },
  services: {
    heading: "Una suite completa de herramientas digitales",
    description:
      "Cada módulo funciona de forma independiente o integrada, adaptándose al ritmo de crecimiento de tu empresa.",
    cta: "Acceder al módulo",
    items: [
      {
        title: "Control de Stock",
        description:
          "Sabé qué tenés en cada depósito, en tiempo real. Alertas automáticas cuando algo se está por acabar y reportes claros.",
      },
      {
        title: "Turnera Digital",
        description:
          "Sistema de agenda inteligente para clientes y proveedores. Reservas online, recordatorios automáticos y optimización de horarios.",
      },
      {
        title: "Facturación con ARCA",
        description:
          "Facturá electrónicamente desde Cuarzo, conectado con ARCA/AFIP. Comprobantes A, B y C, libro IVA digital y más.",
      },
      {
        title: "Tienda & Catálogos",
        description:
          "Tiendas online y catálogos digitales. Integración con Mercado Pago, gestión de pedidos y logística.",
      },
    ],
  },
  values: {
    heading: "Pensado para trabajar en Argentina",
    description: "Una plataforma hecha para el día a día de tu negocio.",
    items: [
      {
        title: "Dejá el papel atrás",
        description:
          "Pasá a digital lo que hoy hacés a mano o en planillas, paso a paso.",
      },
      {
        title: "Crece con vos",
        description:
          "Sumás usuarios y módulos cuando los necesitás, sin cambiar de plataforma.",
      },
      {
        title: "Precisión técnica",
        description:
          "Cada integración y cada flujo, pensados para funcionar todos los días.",
      },
      {
        title: "Hecho para Argentina",
        description:
          "Conectado con ARCA/AFIP y Mercado Pago, sin trucos ni pasos extra.",
      },
    ],
  },
  contact: {
    heading: "Hablemos de tu próximo proyecto",
    description:
      "Contanos qué necesita tu empresa y te armaremos una propuesta a medida. Te respondemos en 24 horas hábiles, sin compromisos.",
    emailLabel: "Email",
    locationLabel: "Ubicación",
    locationValue: "Buenos Aires, Argentina",
    fields: {
      name: "Nombre *",
      email: "Email *",
      company: "Empresa",
      message: "Mensaje *",
      namePlaceholder: "Juan García",
      emailPlaceholder: "juan@empresa.com",
      companyPlaceholder: "Mi Empresa S.A.",
      messagePlaceholder: "Contanos sobre tu proyecto o necesidad...",
    },
    submit: "Enviar mensaje",
    sending: "Enviando...",
    error: "No pudimos enviar tu mensaje. Probá de nuevo o escribinos a contacto@cuarzostudio.com.",
    success: {
      heading: "¡Mensaje enviado!",
      description: "Te respondemos en 24 horas hábiles.",
    },
  },
  footer: {
    tagline: "Soluciones digitales inteligentes para emprendedores y PYMEs argentinas.",
    productHeading: "Producto",
    companyHeading: "Empresa",
    productLinks: ["Control de Stock", "Turnera Digital", "Facturación ARCA", "E-commerce", "Precios"],
    companyLinks: ["Sobre nosotros", "CV", "Contacto"],
    copyright: (year: number) => `© ${year} Cuarzo. Todos los derechos reservados.`,
    location: "Buenos Aires · Argentina",
  },
  pricing: {
    heading: "Elegí el plan que se adapta a tu empresa",
    description: "Empezá gratis y crecé sin límites. Todos los planes incluyen acceso al panel de administración.",
    cta: "Empezar ahora",
    ctaFree: "Comenzar gratis",
    disclaimer: "Precios en USD · Facturación mensual · Cancelá en cualquier momento",
    popular: "Más popular",
    plans: [
      {
        name: "Free",
        price: "0",
        period: "Gratis para siempre",
        features: ["1 usuario", "Módulo Turnera", "Hasta 50 turnos/mes", "Soporte comunitario"],
      },
      {
        name: "Starter",
        price: "19",
        period: "USD / mes",
        features: ["3 usuarios", "Todos los módulos", "Hasta 500 turnos/mes", "Caja Digital", "Soporte por email"],
      },
      {
        name: "Pro",
        price: "49",
        period: "USD / mes",
        features: ["10 usuarios", "Todos los módulos", "Turnos ilimitados", "Facturación ARCA", "CRM + Proveedores", "Soporte prioritario"],
      },
      {
        name: "Enterprise",
        price: "149",
        period: "USD / mes",
        features: ["Usuarios ilimitados", "Todo lo de Pro", "API completa", "Factura en ARS o USD"],
      },
    ],
  },
  whyCuarzo: {
    heading: "El nombre no es casualidad",
    body1:
      "El cuarzo está en cada dispositivo que usás: en el oscilador de tu celular, en los procesadores de tu computadora, en el reloj de tu mano. Es el mineral que sincroniza la tecnología moderna — invisible, preciso, indispensable. Sin él, no hay señal de tiempo, no hay cómputo, no hay nada.",
    body2:
      "Así pensamos nuestros servicios. El control de stock que te avisa a tiempo, la turnera que ordena tu agenda, la facturación conectada con ARCA. No lo ves hasta que no está. Y cuando está, todo funciona. Tu negocio corre sobre una base que no tenés que pensar — igual que el cuarzo.",
    closing: "La base invisible que sostiene tu negocio.",
  },
  customWork: {
    heading: "¿Necesitás algo específico?",
    description:
      "Además de la plataforma, trabajamos en proyectos puntuales. Si tenés una necesidad concreta, hablemos.",
    cta: "Consultá sin compromiso",
    items: [
      {
        title: "CV Profesional",
        description:
          "Diseño y redacción de curriculum vitae optimizado para ATS, con estructura clara y orientado a resultados.",
        tags: ["Redacción", "Diseño", "ATS-friendly"],
      },
      {
        title: "Software a medida",
        description:
          "Aplicaciones web, bots, automatizaciones y scripts adaptados exactamente a tu proceso de negocio.",
        tags: ["Web app", "Bot", "Automatización"],
      },
      {
        title: "Integraciones API",
        description:
          "Conectamos tus sistemas existentes entre sí: ERP, e-commerce, CRM, herramientas internas y más.",
        tags: ["API", "Webhook", "Sync"],
      },
      {
        title: "Consultoría técnica",
        description:
          "Revisión de arquitectura, auditoría de código, definición de stack y acompañamiento técnico de tu equipo.",
        tags: ["Arquitectura", "Code review", "Mentoría"],
      },
      {
        title: "Dominio & Mail corporativo",
        description:
          "Registramos y administramos tu dominio empresarial (.com, .com.ar y más) y configuramos tus cuentas @tuempresa.com. Como hicimos con projaska.com.",
        tags: ["Dominio", "DNS", "Mail corporativo"],
      },
    ],
  },
  auth: {
    login: {
      title: "Iniciar sesión",
      emailLabel: "Email",
      emailPlaceholder: "tu@email.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "••••••••",
      submit: "Iniciar sesión",
      loading: "Iniciando sesión…",
      google: "Continuar con Google",
      noAccount: "¿No tenés cuenta?",
      registerLink: "Registrate",
      error: "Email o contraseña incorrectos.",
    },
    register: {
      title: "Crear tu cuenta",
      businessNameLabel: "Nombre de tu negocio",
      businessNamePlaceholder: "Mi Tienda S.A.",
      nameLabel: "Tu nombre",
      namePlaceholder: "Juan García",
      emailLabel: "Email",
      emailPlaceholder: "tu@email.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Mínimo 8 caracteres",
      confirmLabel: "Confirmar contraseña",
      confirmPlaceholder: "Repetí la contraseña",
      submit: "Crear cuenta gratis",
      loading: "Creando cuenta…",
      google: "Continuar con Google",
      hasAccount: "¿Ya tenés cuenta?",
      loginLink: "Iniciar sesión",
      errors: {
        passwordMismatch: "Las contraseñas no coinciden.",
        passwordShort: "La contraseña debe tener al menos 8 caracteres.",
        generic: "Error al crear la cuenta.",
        loginFail: "Cuenta creada. Iniciá sesión desde /login.",
      },
    },
  },
  admin: {
    nav: {
      dashboard: "Panel",
      appointments: "Turnos",
      catalog: "Catálogo",
      stock: "Inventario",
      orders: "Pedidos",
      billing: "Facturación",
      finance: "Caja Digital",
      tasks: "Tareas",
      reports: "Reportes",
      customers: "Clientes",
      subscription: "Suscripción",
      support: "Soporte",
      settings: "Configuración",
      providers: "Proveedores",
    },
    common: {
      signOut: "Cerrar sesión",
      stopViewing: "Dejando de ver como este tenant",
      exitView: "Salir",
      cancel: "Cancelar",
      save: "Guardar",
      create: "Crear",
      edit: "Editar",
      search: "Buscar",
      showInactive: "Mostrar inactivos",
      noResults: "Sin resultados",
    },
  },
  turnera: {
    layout: {
      myBookings: "Mis reservas",
    },
    page: {
      title: "Reservá tu turno",
      description: "Elegí el servicio, la fecha y el horario. La confirmación llega al instante.",
    },
    check: {
      title: "Mis reservas",
      description: "Ingresá el código de tu reserva, lo encontrás en el email de confirmación.",
      newBooking: "Nueva reserva",
      emailPlaceholder: "TUR-XXXXXX",
      submit: "Buscar",
      loading: "Buscando…",
      networkError: "No se pudo buscar. Verificá tu conexión.",
      noResults: "No encontramos reservas para ese email.",
      noResultsHint: "Verificá que sea el email con el que hiciste la reserva.",
      resultCount: (n: number) =>
        `${n} ${n === 1 ? "reserva encontrada" : "reservas encontradas"}`,
      past: "Pasado",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      min: "min",
      hs: "hs",
    },
    wizard: {
      steps: { service: "Servicio", date: "Fecha", time: "Horario", info: "Tus datos" },
      step1: {
        title: "¿Qué servicio necesitás?",
        description: "Seleccioná el tipo de reunión.",
        free: "Gratis",
        loading: "Cargando servicios…",
        payLater: "· Pago online próximamente",
        min: "min",
      },
      step2: {
        title: "¿Qué día te viene bien?",
        description: "Próximos turnos disponibles (lunes a viernes).",
      },
      step3: {
        title: "Elegí el horario",
        subtitle: (service: string, min: number) => `${service} · ${min} min`,
        takenSlots: "Los horarios tachados ya están reservados.",
      },
      step4: {
        title: "Tus datos",
        description: "Te enviamos la confirmación por email.",
        nameLabel: "Nombre y apellido *",
        namePlaceholder: "Juan García",
        emailLabel: "Email *",
        emailPlaceholder: "juan@empresa.com",
        phoneLabel: "Teléfono / WhatsApp",
        phonePlaceholder: "+54 11 1234-5678",
        notesLabel: "¿Sobre qué necesitás hablar?",
        notesPlaceholder: "Contanos brevemente qué estás buscando…",
      },
      step5: {
        title: "¡Turno confirmado!",
        sentTo: (email: string) => `Te enviamos los detalles a ${email}.`,
        serviceLabel: "Servicio",
        durationLabel: "Duración",
        dateLabel: "Fecha",
        timeLabel: "Horario",
        nameLabel: "Nombre",
        emailLabel: "Email",
        notesLabel: "Notas",
        min: "min",
        hs: "hs",
        calendar: "Agregar al calendario",
        back: "Volver al sitio",
      },
      nav: {
        prev: "Anterior",
        next: "Siguiente",
        confirm: "Confirmar turno",
        confirming: "Confirmando…",
      },
      errors: {
        loadFail: "No se pudieron cargar los servicios.",
        bookFail: "Error al confirmar la reserva.",
      },
    },
  },
} as const;

// ─── English ──────────────────────────────────────────────────────────────────

const en: T = {
  nav: {
    services: "Services",
    custom: "Custom work",
    whyUs: "Why us",
    pricing: "Pricing",
    contact: "Contact",
    start: "Get started",
    login: "Log in",
  },
  hero: {
    heading1: "Stock, bookings",
    heading2: "and invoicing",
    heading3: "all in one place",
    description:
      "The platform for Argentine SMEs: control your stock, take online bookings, invoice through ARCA and sell online.",
    ctaPrimary: "Start for free",
    ctaSecondary: "I need custom development",
  },
  services: {
    heading: "A complete suite of digital tools",
    description:
      "Each module works independently or integrated, adapting to your company's growth pace.",
    cta: "Access module",
    items: [
      {
        title: "Stock Control",
        description:
          "Know what you have in every warehouse, in real time. Automatic alerts when something is running low, and clear reports.",
      },
      {
        title: "Digital Booking",
        description:
          "Smart scheduling for clients and providers. Online bookings, automatic reminders, and time slot optimization.",
      },
      {
        title: "e-Invoicing (ARCA)",
        description:
          "Issue electronic invoices connected to ARCA/AFIP. Type A, B and C receipts, digital VAT ledger, and more.",
      },
      {
        title: "Store & Catalogs",
        description:
          "Online stores and digital catalogs. Mercado Pago integration, order management, and logistics.",
      },
    ],
  },
  values: {
    heading: "Designed for how business works in Argentina",
    description: "A platform made for your business's day to day.",
    items: [
      {
        title: "Leave paper behind",
        description:
          "Move what you do by hand or in spreadsheets to digital, step by step.",
      },
      {
        title: "Grows with you",
        description:
          "Add users and modules when you need them, without switching platforms.",
      },
      {
        title: "Technical precision",
        description:
          "Every integration and every flow, built to work every day.",
      },
      {
        title: "Built for Argentina",
        description:
          "Connected to ARCA/AFIP and Mercado Pago, with no tricks or extra steps.",
      },
    ],
  },
  contact: {
    heading: "Let's talk about your next project",
    description:
      "Tell us what your company needs and we'll build a tailored proposal. We reply within 24 business hours, no commitment.",
    emailLabel: "Email",
    locationLabel: "Location",
    locationValue: "Buenos Aires, Argentina",
    fields: {
      name: "Name *",
      email: "Email *",
      company: "Company",
      message: "Message *",
      namePlaceholder: "John Smith",
      emailPlaceholder: "john@company.com",
      companyPlaceholder: "My Company Inc.",
      messagePlaceholder: "Tell us about your project or need...",
    },
    submit: "Send message",
    sending: "Sending...",
    error: "We couldn't send your message. Try again or write to contacto@cuarzostudio.com.",
    success: {
      heading: "Message sent!",
      description: "We'll reply within 24 business hours.",
    },
  },
  footer: {
    tagline: "Intelligent digital solutions for entrepreneurs and SMEs.",
    productHeading: "Product",
    companyHeading: "Company",
    productLinks: ["Stock Control", "Digital Booking", "e-Invoicing ARCA", "E-commerce", "Pricing"],
    companyLinks: ["About us", "CV", "Contact"],
    copyright: (year: number) => `© ${year} Cuarzo. All rights reserved.`,
    location: "Buenos Aires · Argentina",
  },
  pricing: {
    heading: "Choose the plan that fits your business",
    description: "Start for free and scale without limits. All plans include access to the admin dashboard.",
    cta: "Get started",
    ctaFree: "Start for free",
    disclaimer: "Prices in USD · Monthly billing · Cancel anytime",
    popular: "Most popular",
    plans: [
      {
        name: "Free",
        price: "0",
        period: "Free forever",
        features: ["1 user", "Booking module", "Up to 50 bookings/mo", "Community support"],
      },
      {
        name: "Starter",
        price: "19",
        period: "USD / mo",
        features: ["3 users", "All modules", "Up to 500 bookings/mo", "Cash register", "Email support"],
      },
      {
        name: "Pro",
        price: "49",
        period: "USD / mo",
        features: ["10 users", "All modules", "Unlimited bookings", "e-Invoicing ARCA", "CRM + Suppliers", "Priority support"],
      },
      {
        name: "Enterprise",
        price: "149",
        period: "USD / mo",
        features: ["Unlimited users", "Everything in Pro", "Full API access", "ARS or USD billing"],
      },
    ],
  },
  whyCuarzo: {
    heading: "The name is no coincidence",
    body1:
      "Quartz is in every device you use: in your phone's oscillator, in your computer's processors, in the watch on your wrist. It's the mineral that synchronizes modern technology — invisible, precise, indispensable. Without it, there's no timing signal, no computation, nothing.",
    body2:
      "That's how we think about our services. Stock control that warns you in time, a scheduler that keeps your calendar in order, invoicing connected to ARCA. You don't notice it until it's gone. And when it's there, everything works. Your business runs on a foundation you don't have to think about — just like quartz.",
    closing: "The invisible foundation holding your business together.",
  },
  customWork: {
    heading: "Need something specific?",
    description:
      "Beyond the platform, we take on standalone projects. If you have a concrete need, let's talk.",
    cta: "Get a free quote",
    items: [
      {
        title: "Professional CV",
        description:
          "CV design and writing optimized for ATS systems, with a clear structure and results-oriented content.",
        tags: ["Writing", "Design", "ATS-friendly"],
      },
      {
        title: "Custom software",
        description:
          "Web apps, bots, automations and scripts tailored exactly to your business process.",
        tags: ["Web app", "Bot", "Automation"],
      },
      {
        title: "API integrations",
        description:
          "We connect your existing systems together: ERP, e-commerce, CRM, internal tools and more.",
        tags: ["API", "Webhook", "Sync"],
      },
      {
        title: "Technical consulting",
        description:
          "Architecture review, code audits, stack definition and technical mentoring for your team.",
        tags: ["Architecture", "Code review", "Mentoring"],
      },
      {
        title: "Domain & Corporate email",
        description:
          "We register and manage your business domain (.com and more) and set up your @yourbusiness.com email accounts. Like we did with projaska.com.",
        tags: ["Domain", "DNS", "Corporate email"],
      },
    ],
  },
  auth: {
    login: {
      title: "Log in",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      submit: "Log in",
      loading: "Logging in…",
      google: "Continue with Google",
      noAccount: "Don't have an account?",
      registerLink: "Sign up",
      error: "Invalid email or password.",
    },
    register: {
      title: "Create your account",
      businessNameLabel: "Business name",
      businessNamePlaceholder: "My Business Inc.",
      nameLabel: "Your name",
      namePlaceholder: "John Smith",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmLabel: "Confirm password",
      confirmPlaceholder: "Repeat your password",
      submit: "Create free account",
      loading: "Creating account…",
      google: "Continue with Google",
      hasAccount: "Already have an account?",
      loginLink: "Log in",
      errors: {
        passwordMismatch: "Passwords don't match.",
        passwordShort: "Password must be at least 8 characters.",
        generic: "Error creating account.",
        loginFail: "Account created. Please log in from /login.",
      },
    },
  },
  admin: {
    nav: {
      dashboard: "Dashboard",
      appointments: "Appointments",
      catalog: "Catalog",
      stock: "Stock",
      orders: "Orders",
      billing: "Billing",
      finance: "Finance",
      tasks: "Tasks",
      reports: "Reports",
      customers: "Customers",
      subscription: "Subscription",
      support: "Support",
      settings: "Settings",
      providers: "Providers",
    },
    common: {
      signOut: "Sign out",
      stopViewing: "Viewing as tenant",
      exitView: "Exit",
      cancel: "Cancel",
      save: "Save",
      create: "Create",
      edit: "Edit",
      search: "Search",
      showInactive: "Show inactive",
      noResults: "No results",
    },
  },
  turnera: {
    layout: {
      myBookings: "My bookings",
    },
    page: {
      title: "Book your appointment",
      description: "Choose your service, date and time. Confirmation arrives instantly.",
    },
    check: {
      title: "My bookings",
      description: "Enter your booking code, you can find it in your confirmation email.",
      newBooking: "New booking",
      emailPlaceholder: "TUR-XXXXXX",
      submit: "Search",
      loading: "Searching…",
      networkError: "Search failed. Check your connection.",
      noResults: "No bookings found for that email.",
      noResultsHint: "Make sure you're using the email you booked with.",
      resultCount: (n: number) => `${n} booking${n === 1 ? "" : "s"} found`,
      past: "Past",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      min: "min",
      hs: "h",
    },
    wizard: {
      steps: { service: "Service", date: "Date", time: "Time", info: "Your info" },
      step1: {
        title: "What service do you need?",
        description: "Select the type of meeting.",
        free: "Free",
        loading: "Loading services…",
        payLater: "· Online payment coming soon",
        min: "min",
      },
      step2: {
        title: "Which day works for you?",
        description: "Next available slots (Monday to Friday).",
      },
      step3: {
        title: "Choose a time",
        subtitle: (service: string, min: number) => `${service} · ${min} min`,
        takenSlots: "Strikethrough slots are already taken.",
      },
      step4: {
        title: "Your details",
        description: "We'll send confirmation to your email.",
        nameLabel: "Full name *",
        namePlaceholder: "John Smith",
        emailLabel: "Email *",
        emailPlaceholder: "john@company.com",
        phoneLabel: "Phone / WhatsApp",
        phonePlaceholder: "+1 555 000 0000",
        notesLabel: "What do you want to discuss?",
        notesPlaceholder: "Briefly tell us what you're looking for…",
      },
      step5: {
        title: "Booking confirmed!",
        sentTo: (email: string) => `We sent the details to ${email}.`,
        serviceLabel: "Service",
        durationLabel: "Duration",
        dateLabel: "Date",
        timeLabel: "Time",
        nameLabel: "Name",
        emailLabel: "Email",
        notesLabel: "Notes",
        min: "min",
        hs: "h",
        calendar: "Add to calendar",
        back: "Back to site",
      },
      nav: {
        prev: "Back",
        next: "Next",
        confirm: "Confirm booking",
        confirming: "Confirming…",
      },
      errors: {
        loadFail: "Could not load services.",
        bookFail: "Error confirming booking.",
      },
    },
  },
};

// ─── Portuguese ───────────────────────────────────────────────────────────────

const pt: T = {
  nav: {
    services: "Serviços",
    custom: "Sob medida",
    whyUs: "Por que nos escolher",
    pricing: "Preços",
    contact: "Contato",
    start: "Começar",
    login: "Entrar",
  },
  hero: {
    heading1: "Estoque, agenda",
    heading2: "e faturamento",
    heading3: "em um só lugar",
    description:
      "A plataforma para PMEs argentinas: controle seu estoque, receba reservas online, fature com ARCA e venda pela internet.",
    ctaPrimary: "Começar grátis",
    ctaSecondary: "Preciso de um desenvolvimento sob medida",
  },
  services: {
    heading: "Uma suite completa de ferramentas digitais",
    description:
      "Cada módulo funciona de forma independente ou integrada, adaptando-se ao ritmo de crescimento da sua empresa.",
    cta: "Acessar módulo",
    items: [
      {
        title: "Controle de Estoque",
        description:
          "Saiba o que você tem em cada depósito, em tempo real. Alertas automáticos quando algo está acabando e relatórios claros.",
      },
      {
        title: "Agendamento Digital",
        description:
          "Sistema de agenda inteligente para clientes e fornecedores. Reservas online, lembretes automáticos e otimização de horários.",
      },
      {
        title: "Faturamento com ARCA",
        description:
          "Emita faturas eletrônicas conectado à ARCA/AFIP. Comprovantes A, B e C, livro de IVA digital e mais.",
      },
      {
        title: "Loja & Catálogos",
        description:
          "Lojas online e catálogos digitais. Integração com Mercado Pago, gestão de pedidos e logística.",
      },
    ],
  },
  values: {
    heading: "Pensado para trabalhar na Argentina",
    description: "Uma plataforma feita para o dia a dia do seu negócio.",
    items: [
      {
        title: "Deixe o papel para trás",
        description:
          "Passe para o digital o que hoje você faz à mão ou em planilhas, passo a passo.",
      },
      {
        title: "Cresce com você",
        description:
          "Adicione usuários e módulos quando precisar, sem trocar de plataforma.",
      },
      {
        title: "Precisão técnica",
        description:
          "Cada integração e cada fluxo, pensados para funcionar todos os dias.",
      },
      {
        title: "Feito para a Argentina",
        description:
          "Conectado à ARCA/AFIP e ao Mercado Pago, sem truques nem etapas extras.",
      },
    ],
  },
  contact: {
    heading: "Vamos falar sobre seu próximo projeto",
    description:
      "Conte-nos o que sua empresa precisa e montaremos uma proposta personalizada. Respondemos em 24 horas úteis, sem compromisso.",
    emailLabel: "E-mail",
    locationLabel: "Localização",
    locationValue: "Buenos Aires, Argentina",
    fields: {
      name: "Nome *",
      email: "E-mail *",
      company: "Empresa",
      message: "Mensagem *",
      namePlaceholder: "João Silva",
      emailPlaceholder: "joao@empresa.com",
      companyPlaceholder: "Minha Empresa Ltda.",
      messagePlaceholder: "Conte-nos sobre seu projeto ou necessidade...",
    },
    submit: "Enviar mensagem",
    sending: "Enviando...",
    error: "Não foi possível enviar sua mensagem. Tente novamente ou escreva para contacto@cuarzostudio.com.",
    success: {
      heading: "Mensagem enviada!",
      description: "Respondemos em 24 horas úteis.",
    },
  },
  footer: {
    tagline: "Soluções digitais inteligentes para empreendedores e PMEs.",
    productHeading: "Produto",
    companyHeading: "Empresa",
    productLinks: ["Controle de Estoque", "Agendamento Digital", "Faturamento ARCA", "E-commerce", "Preços"],
    companyLinks: ["Sobre nós", "CV", "Contato"],
    copyright: (year: number) => `© ${year} Cuarzo. Todos os direitos reservados.`,
    location: "Buenos Aires · Argentina",
  },
  pricing: {
    heading: "Escolha o plano que se adapta à sua empresa",
    description: "Comece gratuitamente e cresça sem limites. Todos os planos incluem acesso ao painel de administração.",
    cta: "Começar agora",
    ctaFree: "Começar grátis",
    disclaimer: "Preços em USD · Cobrança mensal · Cancele quando quiser",
    popular: "Mais popular",
    plans: [
      {
        name: "Free",
        price: "0",
        period: "Grátis para sempre",
        features: ["1 usuário", "Módulo de agendamento", "Até 50 agendamentos/mês", "Suporte comunitário"],
      },
      {
        name: "Starter",
        price: "19",
        period: "USD / mês",
        features: ["3 usuários", "Todos os módulos", "Até 500 agendamentos/mês", "Caixa Digital", "Suporte por e-mail"],
      },
      {
        name: "Pro",
        price: "49",
        period: "USD / mês",
        features: ["10 usuários", "Todos os módulos", "Agendamentos ilimitados", "Faturamento ARCA", "CRM + Fornecedores", "Suporte prioritário"],
      },
      {
        name: "Enterprise",
        price: "149",
        period: "USD / mês",
        features: ["Usuários ilimitados", "Tudo do Pro", "API completa", "Fatura em ARS ou USD"],
      },
    ],
  },
  whyCuarzo: {
    heading: "O nome não é coincidência",
    body1:
      "O quartzo está em cada dispositivo que você usa: no oscilador do seu celular, nos processadores do seu computador, no relógio no seu pulso. É o mineral que sincroniza a tecnologia moderna — invisível, preciso, indispensável. Sem ele, não há sinal de tempo, não há computação, não há nada.",
    body2:
      "É assim que pensamos nossos serviços. O controle de estoque que avisa a tempo, a agenda que organiza seus horários, o faturamento conectado à ARCA. Você não percebe até que não está. E quando está, tudo funciona. Seu negócio roda sobre uma base que você não precisa pensar — assim como o quartzo.",
    closing: "A base invisível que sustenta o seu negócio.",
  },
  customWork: {
    heading: "Precisa de algo específico?",
    description:
      "Além da plataforma, trabalhamos em projetos pontuais. Se tiver uma necessidade concreta, vamos conversar.",
    cta: "Consulte sem compromisso",
    items: [
      {
        title: "CV Profissional",
        description:
          "Design e redação de currículo otimizado para ATS, com estrutura clara e orientado a resultados.",
        tags: ["Redação", "Design", "ATS-friendly"],
      },
      {
        title: "Software sob medida",
        description:
          "Aplicativos web, bots, automações e scripts adaptados exatamente ao seu processo de negócio.",
        tags: ["Web app", "Bot", "Automação"],
      },
      {
        title: "Integrações API",
        description:
          "Conectamos seus sistemas existentes entre si: ERP, e-commerce, CRM, ferramentas internas e mais.",
        tags: ["API", "Webhook", "Sync"],
      },
      {
        title: "Consultoria técnica",
        description:
          "Revisão de arquitetura, auditoria de código, definição de stack e mentoria técnica para sua equipe.",
        tags: ["Arquitetura", "Code review", "Mentoria"],
      },
      {
        title: "Domínio & E-mail corporativo",
        description:
          "Registramos e administramos seu domínio empresarial (.com e mais) e configuramos suas contas @suaempresa.com. Como fizemos com projaska.com.",
        tags: ["Domínio", "DNS", "E-mail corporativo"],
      },
    ],
  },
  auth: {
    login: {
      title: "Entrar",
      emailLabel: "E-mail",
      emailPlaceholder: "voce@email.com",
      passwordLabel: "Senha",
      passwordPlaceholder: "••••••••",
      submit: "Entrar",
      loading: "Entrando…",
      google: "Continuar com Google",
      noAccount: "Não tem uma conta?",
      registerLink: "Cadastre-se",
      error: "E-mail ou senha incorretos.",
    },
    register: {
      title: "Crie sua conta",
      businessNameLabel: "Nome do seu negócio",
      businessNamePlaceholder: "Meu Negócio Ltda.",
      nameLabel: "Seu nome",
      namePlaceholder: "João Silva",
      emailLabel: "E-mail",
      emailPlaceholder: "voce@email.com",
      passwordLabel: "Senha",
      passwordPlaceholder: "Mínimo 8 caracteres",
      confirmLabel: "Confirmar senha",
      confirmPlaceholder: "Repita a senha",
      submit: "Criar conta grátis",
      loading: "Criando conta…",
      google: "Continuar com Google",
      hasAccount: "Já tem uma conta?",
      loginLink: "Entrar",
      errors: {
        passwordMismatch: "As senhas não coincidem.",
        passwordShort: "A senha deve ter pelo menos 8 caracteres.",
        generic: "Erro ao criar a conta.",
        loginFail: "Conta criada. Faça login em /login.",
      },
    },
  },
  admin: {
    nav: {
      dashboard: "Painel",
      appointments: "Agendamentos",
      catalog: "Catálogo",
      stock: "Estoque",
      orders: "Pedidos",
      billing: "Faturamento",
      finance: "Caixa",
      tasks: "Tarefas",
      reports: "Relatórios",
      customers: "Clientes",
      subscription: "Assinatura",
      support: "Suporte",
      settings: "Configurações",
      providers: "Fornecedores",
    },
    common: {
      signOut: "Sair",
      stopViewing: "Visualizando como tenant",
      exitView: "Sair",
      cancel: "Cancelar",
      save: "Salvar",
      create: "Criar",
      edit: "Editar",
      search: "Buscar",
      showInactive: "Mostrar inativos",
      noResults: "Sem resultados",
    },
  },
  turnera: {
    layout: {
      myBookings: "Meus agendamentos",
    },
    page: {
      title: "Agende seu horário",
      description: "Escolha o serviço, a data e o horário. A confirmação chega na hora.",
    },
    check: {
      title: "Meus agendamentos",
      description: "Digite o código da sua reserva, ele está no e-mail de confirmação.",
      newBooking: "Novo agendamento",
      emailPlaceholder: "TUR-XXXXXX",
      submit: "Buscar",
      loading: "Buscando…",
      networkError: "Não foi possível buscar. Verifique sua conexão.",
      noResults: "Nenhum agendamento encontrado para esse e-mail.",
      noResultsHint: "Verifique se é o e-mail com o qual fez o agendamento.",
      resultCount: (n: number) =>
        `${n} agendamento${n === 1 ? "" : "s"} encontrado${n === 1 ? "" : "s"}`,
      past: "Passado",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      min: "min",
      hs: "h",
    },
    wizard: {
      steps: { service: "Serviço", date: "Data", time: "Horário", info: "Seus dados" },
      step1: {
        title: "Qual serviço você precisa?",
        description: "Selecione o tipo de reunião.",
        free: "Grátis",
        loading: "Carregando serviços…",
        payLater: "· Pagamento online em breve",
        min: "min",
      },
      step2: {
        title: "Qual dia é melhor para você?",
        description: "Próximos horários disponíveis (segunda a sexta).",
      },
      step3: {
        title: "Escolha um horário",
        subtitle: (service: string, min: number) => `${service} · ${min} min`,
        takenSlots: "Horários riscados já estão reservados.",
      },
      step4: {
        title: "Seus dados",
        description: "Enviaremos a confirmação para seu e-mail.",
        nameLabel: "Nome completo *",
        namePlaceholder: "João Silva",
        emailLabel: "E-mail *",
        emailPlaceholder: "joao@empresa.com",
        phoneLabel: "Telefone / WhatsApp",
        phonePlaceholder: "+55 11 91234-5678",
        notesLabel: "Sobre o que você quer falar?",
        notesPlaceholder: "Conte-nos brevemente o que você está buscando…",
      },
      step5: {
        title: "Agendamento confirmado!",
        sentTo: (email: string) => `Enviamos os detalhes para ${email}.`,
        serviceLabel: "Serviço",
        durationLabel: "Duração",
        dateLabel: "Data",
        timeLabel: "Horário",
        nameLabel: "Nome",
        emailLabel: "E-mail",
        notesLabel: "Notas",
        min: "min",
        hs: "h",
        calendar: "Adicionar ao calendário",
        back: "Voltar ao site",
      },
      nav: {
        prev: "Anterior",
        next: "Próximo",
        confirm: "Confirmar agendamento",
        confirming: "Confirmando…",
      },
      errors: {
        loadFail: "Não foi possível carregar os serviços.",
        bookFail: "Erro ao confirmar o agendamento.",
      },
    },
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const translations: Record<Locale, T> = { es, en, pt };
