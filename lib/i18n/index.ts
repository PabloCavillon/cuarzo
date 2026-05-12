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
  nav: { services: string; whyUs: string; pricing: string; contact: string; start: string; login: string };
  hero: {
    badge: string; heading1: string; heading2: string; heading3: string;
    description: string; ctaPrimary: string; ctaSecondary: string; scroll: string;
    stats: { uptime: string; onboarding: string; arca: string };
  };
  services: {
    eyebrow: string; heading: string; description: string; cta: string;
    items: { tag: string; title: string; description: string }[];
  };
  values: {
    eyebrow: string; heading: string; description: string;
    items: { title: string; description: string }[];
    stats: { value: string; label: string }[];
  };
  contact: {
    eyebrow: string; heading: string; description: string;
    emailLabel: string; locationLabel: string; locationValue: string;
    fields: {
      name: string; email: string; company: string; message: string;
      namePlaceholder: string; emailPlaceholder: string;
      companyPlaceholder: string; messagePlaceholder: string;
    };
    submit: string; sending: string;
    success: { heading: string; description: string };
  };
  footer: {
    tagline: string; productHeading: string; companyHeading: string;
    productLinks: string[]; companyLinks: string[];
    copyright: (year: number) => string; location: string;
  };
  portfolio: {
    eyebrow: string;
    heading: string;
    description: string;
    cases: {
      industry: string;
      title: string;
      challenge: string;
      solution: string;
      metrics: { value: string; label: string }[];
    }[];
  };
  pricing: {
    eyebrow: string;
    heading: string;
    description: string;
    monthly: string;
    cta: string;
    ctaFree: string;
    popular: string;
    plans: {
      name: string;
      price: string;
      period: string;
      features: string[];
    }[];
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
    whyUs: "Por qué elegirnos",
    pricing: "Precios",
    contact: "Contacto",
    start: "Empezar",
    login: "Iniciar sesión",
  },
  hero: {
    badge: "Soluciones Digitales Inteligentes",
    heading1: "Escala tu negocio",
    heading2: "con tecnología",
    heading3: "de precisión",
    description:
      "Potenciamos PYMEs y startups argentinas con herramientas de nivel enterprise. Control de stock, turneras, facturación ARCA y e-commerce, todo en un ecosistema único.",
    ctaPrimary: "Comenzar ahora",
    ctaSecondary: "Ver servicios",
    scroll: "Descubrir",
    stats: {
      uptime: "Uptime",
      onboarding: "Onboarding",
      arca: "ARCA/AFIP",
    },
  },
  services: {
    eyebrow: "El Ecosistema Cuarzo",
    heading: "Una suite completa de herramientas digitales",
    description:
      "Cada módulo funciona de forma independiente o integrada, adaptándose al ritmo de crecimiento de tu empresa.",
    cta: "Acceder al módulo",
    items: [
      {
        tag: "Inventario",
        title: "Control de Stock",
        description:
          "Gestión de inventario en tiempo real con trazabilidad completa. Alertas automáticas, reportes avanzados y sincronización multi-depósito.",
      },
      {
        tag: "Scheduling",
        title: "Turnera Digital",
        description:
          "Sistema de agenda inteligente para clientes y proveedores. Reservas online, recordatorios automáticos y optimización de horarios.",
      },
      {
        tag: "Fiscal",
        title: "Facturación con ARCA",
        description:
          "Integración nativa con ARCA/AFIP para facturación electrónica sin fricciones. Comprobantes A, B y C, libro IVA digital y más.",
      },
      {
        tag: "E-commerce",
        title: "Tienda & Catálogos",
        description:
          "Tiendas online y catálogos digitales de alto rendimiento. Integración con Mercado Pago, gestión de pedidos y logística.",
      },
    ],
  },
  values: {
    eyebrow: "Por qué elegirnos",
    heading: "Tecnología de precisión, resultados reales",
    description: "No vendemos software. Construimos el backbone digital de tu empresa.",
    items: [
      {
        title: "Modernización sin fricciones",
        description:
          "Migra tus procesos analógicos al mundo digital con acompañamiento experto. Cero interrupción operativa.",
      },
      {
        title: "Escalabilidad garantizada",
        description:
          "Arquitectura que crece con vos. Desde 10 hasta 10.000 transacciones diarias sin cambiar de plataforma.",
      },
      {
        title: "Precisión técnica",
        description:
          "Cada integración, cada flujo, cada endpoint diseñado con estándares de producción enterprise.",
      },
      {
        title: "Hecho para Argentina",
        description:
          "Integración nativa con ARCA/AFIP, Mercado Pago y el ecosistema fiscal argentino. Sin workarounds.",
      },
    ],
    stats: [
      { value: "100%", label: "Integración ARCA/AFIP" },
      { value: "< 24h", label: "Tiempo de onboarding" },
      { value: "99.9%", label: "Uptime garantizado" },
      { value: "∞", label: "Escalabilidad" },
    ],
  },
  contact: {
    eyebrow: "Contacto",
    heading: "Hablemos de tu próximo proyecto",
    description:
      "Contanos qué necesita tu empresa y te armaremos una propuesta a medida. Sin compromisos, sin letras chicas.",
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
    success: {
      heading: "¡Mensaje enviado!",
      description: "Te contactaremos en menos de 24 horas hábiles.",
    },
  },
  footer: {
    tagline: "Soluciones digitales inteligentes para emprendedores y PYMEs argentinas.",
    productHeading: "Producto",
    companyHeading: "Empresa",
    productLinks: ["Control de Stock", "Turnera Digital", "Facturación ARCA", "E-commerce", "Precios"],
    companyLinks: ["Sobre nosotros", "Portfolio", "CV", "Contacto"],
    copyright: (year: number) => `© ${year} Cuarzo. Todos los derechos reservados.`,
    location: "Buenos Aires · Argentina",
  },
  portfolio: {
    eyebrow: "Casos de éxito",
    heading: "Resultados reales para negocios reales",
    description: "Cada implementación es única. Estos son algunos de los desafíos que resolvimos.",
    cases: [
      {
        industry: "Indumentaria",
        title: "Tienda de ropa con stock en 3 locales",
        challenge: "Inventario desincronizado entre sucursales generaba quiebres de stock y ventas perdidas.",
        solution: "Implementamos control de stock multi-depósito con alertas automáticas y trazabilidad completa.",
        metrics: [
          { value: "−40%", label: "Quiebres de stock" },
          { value: "+28%", label: "Ventas recuperadas" },
          { value: "3 días", label: "Tiempo de implementación" },
        ],
      },
      {
        industry: "Salud",
        title: "Consultorio médico con gestión de turnos",
        challenge: "Agenda manual con sobreturno frecuente y alta tasa de ausencias sin previo aviso.",
        solution: "Turnera digital con confirmación automática por email y recordatorios 24 hs antes.",
        metrics: [
          { value: "−65%", label: "Ausencias sin aviso" },
          { value: "24/7", label: "Reservas online" },
          { value: "< 1 día", label: "Onboarding" },
        ],
      },
      {
        industry: "Distribuidora",
        title: "Facturación electrónica ARCA sin errores",
        challenge: "Proceso manual de facturación con AFIP con errores frecuentes y tiempo excesivo.",
        solution: "Integración nativa con ARCA/AFIP. Comprobantes A, B y C generados en segundos.",
        metrics: [
          { value: "100%", label: "Comprobantes válidos" },
          { value: "−90%", label: "Tiempo de facturación" },
          { value: "0", label: "Errores AFIP" },
        ],
      },
    ],
  },
  pricing: {
    eyebrow: "Planes y precios",
    heading: "Elegí el plan que se adapta a tu empresa",
    description: "Empezá gratis y crecé sin límites. Todos los planes incluyen acceso al panel de administración.",
    monthly: "/ mes",
    cta: "Empezar ahora",
    ctaFree: "Comenzar gratis",
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
        features: ["Usuarios ilimitados", "Todo lo de Pro", "SLA 99.9%", "Onboarding dedicado", "API completa", "Factura en ARS o USD"],
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
      description: "Ingresá tu email para ver todos tus turnos.",
      newBooking: "Nueva reserva",
      emailPlaceholder: "tu@email.com",
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
    whyUs: "Why us",
    pricing: "Pricing",
    contact: "Contact",
    start: "Get started",
    login: "Log in",
  },
  hero: {
    badge: "Intelligent Digital Solutions",
    heading1: "Scale your business",
    heading2: "with precision",
    heading3: "technology",
    description:
      "We empower SMEs and startups with enterprise-grade tools. Inventory management, scheduling, e-invoicing and e-commerce — all in one ecosystem.",
    ctaPrimary: "Get started",
    ctaSecondary: "See services",
    scroll: "Discover",
    stats: {
      uptime: "Uptime",
      onboarding: "Onboarding",
      arca: "ARCA/AFIP",
    },
  },
  services: {
    eyebrow: "The Cuarzo Ecosystem",
    heading: "A complete suite of digital tools",
    description:
      "Each module works independently or integrated, adapting to your company's growth pace.",
    cta: "Access module",
    items: [
      {
        tag: "Inventory",
        title: "Stock Control",
        description:
          "Real-time inventory management with full traceability. Automatic alerts, advanced reports, and multi-warehouse sync.",
      },
      {
        tag: "Scheduling",
        title: "Digital Booking",
        description:
          "Smart scheduling for clients and providers. Online bookings, automatic reminders, and time slot optimization.",
      },
      {
        tag: "Fiscal",
        title: "e-Invoicing (ARCA)",
        description:
          "Native integration with ARCA/AFIP for frictionless electronic invoicing. Type A, B and C receipts, digital VAT ledger, and more.",
      },
      {
        tag: "E-commerce",
        title: "Store & Catalogs",
        description:
          "High-performance online stores and digital catalogs. Mercado Pago integration, order management, and logistics.",
      },
    ],
  },
  values: {
    eyebrow: "Why choose us",
    heading: "Precision technology, real results",
    description: "We don't sell software. We build your company's digital backbone.",
    items: [
      {
        title: "Frictionless modernization",
        description:
          "Migrate your analog processes to the digital world with expert guidance. Zero operational disruption.",
      },
      {
        title: "Guaranteed scalability",
        description:
          "Architecture that grows with you. From 10 to 10,000 daily transactions without switching platforms.",
      },
      {
        title: "Technical precision",
        description:
          "Every integration, every flow, every endpoint designed to enterprise production standards.",
      },
      {
        title: "Built for Argentina",
        description:
          "Native integration with ARCA/AFIP, Mercado Pago, and the Argentine fiscal ecosystem. No workarounds.",
      },
    ],
    stats: [
      { value: "100%", label: "ARCA/AFIP Integration" },
      { value: "< 24h", label: "Onboarding time" },
      { value: "99.9%", label: "Guaranteed uptime" },
      { value: "∞", label: "Scalability" },
    ],
  },
  contact: {
    eyebrow: "Contact",
    heading: "Let's talk about your next project",
    description:
      "Tell us what your company needs and we'll build a tailored proposal. No commitments, no fine print.",
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
    success: {
      heading: "Message sent!",
      description: "We'll get back to you within 24 business hours.",
    },
  },
  footer: {
    tagline: "Intelligent digital solutions for entrepreneurs and SMEs.",
    productHeading: "Product",
    companyHeading: "Company",
    productLinks: ["Stock Control", "Digital Booking", "e-Invoicing ARCA", "E-commerce", "Pricing"],
    companyLinks: ["About us", "Portfolio", "CV", "Contact"],
    copyright: (year: number) => `© ${year} Cuarzo. All rights reserved.`,
    location: "Buenos Aires · Argentina",
  },
  portfolio: {
    eyebrow: "Case studies",
    heading: "Real results for real businesses",
    description: "Every implementation is unique. These are some of the challenges we solved.",
    cases: [
      {
        industry: "Retail",
        title: "Clothing store with stock across 3 locations",
        challenge: "Unsynchronized inventory between branches caused stockouts and lost sales.",
        solution: "Multi-warehouse stock control with automatic alerts and full traceability.",
        metrics: [
          { value: "−40%", label: "Stockouts" },
          { value: "+28%", label: "Recovered sales" },
          { value: "3 days", label: "Implementation time" },
        ],
      },
      {
        industry: "Healthcare",
        title: "Medical clinic with appointment management",
        challenge: "Manual scheduling with frequent double-bookings and high no-show rate.",
        solution: "Digital booking system with automatic email confirmation and 24-hour reminders.",
        metrics: [
          { value: "−65%", label: "No-shows" },
          { value: "24/7", label: "Online bookings" },
          { value: "< 1 day", label: "Onboarding" },
        ],
      },
      {
        industry: "Distribution",
        title: "Error-free ARCA e-invoicing",
        challenge: "Manual AFIP invoicing with frequent errors and excessive time spent.",
        solution: "Native ARCA/AFIP integration. Type A, B and C receipts generated in seconds.",
        metrics: [
          { value: "100%", label: "Valid receipts" },
          { value: "−90%", label: "Invoicing time" },
          { value: "0", label: "AFIP errors" },
        ],
      },
    ],
  },
  pricing: {
    eyebrow: "Plans & Pricing",
    heading: "Choose the plan that fits your business",
    description: "Start for free and scale without limits. All plans include access to the admin dashboard.",
    monthly: "/ mo",
    cta: "Get started",
    ctaFree: "Start for free",
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
        features: ["Unlimited users", "Everything in Pro", "99.9% SLA", "Dedicated onboarding", "Full API access", "ARS or USD billing"],
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
      description: "Enter your email to see all your appointments.",
      newBooking: "New booking",
      emailPlaceholder: "you@email.com",
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
    whyUs: "Por que nos escolher",
    pricing: "Preços",
    contact: "Contato",
    start: "Começar",
    login: "Entrar",
  },
  hero: {
    badge: "Soluções Digitais Inteligentes",
    heading1: "Escale seu negócio",
    heading2: "com tecnologia",
    heading3: "de precisão",
    description:
      "Potencializamos PMEs e startups com ferramentas de nível enterprise. Controle de estoque, agendamento, faturamento e e-commerce — tudo em um ecossistema único.",
    ctaPrimary: "Começar agora",
    ctaSecondary: "Ver serviços",
    scroll: "Descobrir",
    stats: {
      uptime: "Uptime",
      onboarding: "Onboarding",
      arca: "ARCA/AFIP",
    },
  },
  services: {
    eyebrow: "O Ecossistema Cuarzo",
    heading: "Uma suite completa de ferramentas digitais",
    description:
      "Cada módulo funciona de forma independente ou integrada, adaptando-se ao ritmo de crescimento da sua empresa.",
    cta: "Acessar módulo",
    items: [
      {
        tag: "Inventário",
        title: "Controle de Estoque",
        description:
          "Gestão de inventário em tempo real com rastreabilidade completa. Alertas automáticos, relatórios avançados e sincronização multi-depósito.",
      },
      {
        tag: "Agendamento",
        title: "Agendamento Digital",
        description:
          "Sistema de agenda inteligente para clientes e fornecedores. Reservas online, lembretes automáticos e otimização de horários.",
      },
      {
        tag: "Fiscal",
        title: "Faturamento com ARCA",
        description:
          "Integração nativa com ARCA/AFIP para faturamento eletrônico sem fricções. Comprovantes A, B e C, livro de IVA digital e mais.",
      },
      {
        tag: "E-commerce",
        title: "Loja & Catálogos",
        description:
          "Lojas online e catálogos digitais de alto desempenho. Integração com Mercado Pago, gestão de pedidos e logística.",
      },
    ],
  },
  values: {
    eyebrow: "Por que nos escolher",
    heading: "Tecnologia de precisão, resultados reais",
    description: "Não vendemos software. Construímos o backbone digital da sua empresa.",
    items: [
      {
        title: "Modernização sem fricções",
        description:
          "Migre seus processos analógicos para o mundo digital com acompanhamento especializado. Zero interrupção operacional.",
      },
      {
        title: "Escalabilidade garantida",
        description:
          "Arquitetura que cresce com você. De 10 a 10.000 transações diárias sem trocar de plataforma.",
      },
      {
        title: "Precisão técnica",
        description:
          "Cada integração, cada fluxo, cada endpoint projetado com padrões de produção enterprise.",
      },
      {
        title: "Feito para a Argentina",
        description:
          "Integração nativa com ARCA/AFIP, Mercado Pago e o ecossistema fiscal argentino. Sem workarounds.",
      },
    ],
    stats: [
      { value: "100%", label: "Integração ARCA/AFIP" },
      { value: "< 24h", label: "Tempo de onboarding" },
      { value: "99.9%", label: "Uptime garantido" },
      { value: "∞", label: "Escalabilidade" },
    ],
  },
  contact: {
    eyebrow: "Contato",
    heading: "Vamos falar sobre seu próximo projeto",
    description:
      "Conte-nos o que sua empresa precisa e montaremos uma proposta personalizada. Sem compromissos, sem letras miúdas.",
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
    success: {
      heading: "Mensagem enviada!",
      description: "Entraremos em contato em menos de 24 horas úteis.",
    },
  },
  footer: {
    tagline: "Soluções digitais inteligentes para empreendedores e PMEs.",
    productHeading: "Produto",
    companyHeading: "Empresa",
    productLinks: ["Controle de Estoque", "Agendamento Digital", "Faturamento ARCA", "E-commerce", "Preços"],
    companyLinks: ["Sobre nós", "Portfolio", "CV", "Contato"],
    copyright: (year: number) => `© ${year} Cuarzo. Todos os direitos reservados.`,
    location: "Buenos Aires · Argentina",
  },
  portfolio: {
    eyebrow: "Casos de sucesso",
    heading: "Resultados reais para negócios reais",
    description: "Cada implementação é única. Estes são alguns dos desafios que resolvemos.",
    cases: [
      {
        industry: "Varejo",
        title: "Loja de roupas com estoque em 3 filiais",
        challenge: "Inventário desincronizado entre filiais causava rupturas de estoque e vendas perdidas.",
        solution: "Controle de estoque multi-depósito com alertas automáticos e rastreabilidade completa.",
        metrics: [
          { value: "−40%", label: "Rupturas de estoque" },
          { value: "+28%", label: "Vendas recuperadas" },
          { value: "3 dias", label: "Tempo de implementação" },
        ],
      },
      {
        industry: "Saúde",
        title: "Clínica médica com gestão de agendamentos",
        challenge: "Agenda manual com excesso frequente de reservas e alta taxa de ausências.",
        solution: "Sistema de agendamento digital com confirmação automática por e-mail e lembretes.",
        metrics: [
          { value: "−65%", label: "Ausências sem aviso" },
          { value: "24/7", label: "Agendamentos online" },
          { value: "< 1 dia", label: "Onboarding" },
        ],
      },
      {
        industry: "Distribuição",
        title: "Faturamento eletrônico ARCA sem erros",
        challenge: "Processo manual de faturamento com erros frequentes e tempo excessivo.",
        solution: "Integração nativa com ARCA/AFIP. Comprovantes A, B e C gerados em segundos.",
        metrics: [
          { value: "100%", label: "Comprovantes válidos" },
          { value: "−90%", label: "Tempo de faturamento" },
          { value: "0", label: "Erros AFIP" },
        ],
      },
    ],
  },
  pricing: {
    eyebrow: "Planos e preços",
    heading: "Escolha o plano que se adapta à sua empresa",
    description: "Comece gratuitamente e cresça sem limites. Todos os planos incluem acesso ao painel de administração.",
    monthly: "/ mês",
    cta: "Começar agora",
    ctaFree: "Começar grátis",
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
        features: ["Usuários ilimitados", "Tudo do Pro", "SLA 99,9%", "Onboarding dedicado", "API completa", "Fatura em ARS ou USD"],
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
      description: "Digite seu e-mail para ver todos os seus horários.",
      newBooking: "Novo agendamento",
      emailPlaceholder: "voce@email.com",
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
