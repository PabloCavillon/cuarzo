export const locales = ["es", "en", "pt"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

// Explicit type so all three locale objects are structurally validated.
export type T = {
  nav: { services: string; whyUs: string; custom: string; start: string; menu: string; language: string; skip: string };
  pages: {
    home: string;
    notFound: { title: string; description: string };
    error: { title: string; description: string; retry: string; id: string };
  };
  hero: {
    heading1: string; heading2: string; heading3: string;
    description: string; ctaPrimary: string;
    order: { title: string; steps: string[]; done: string };
  };
  ticker: string[];
  demos: { commerce: string[]; automation: string[] };
  services: {
    heading: string; description: string;
    items: { title: string; description: string }[];
  };
  values: {
    heading: string; description: string;
    steps: string[];
    items: { title: string; description: string }[];
  };
  team: {
    heading: string; description: string;
    cv: string;
    items: { name: string; role: string; bio: string; href: string }[];
  };
  contact: {
    heading: string; description: string;
    emailLabel: string; locationLabel: string; locationValue: string;
    whatsappCta: string; whatsappMessage: string;
    fields: {
      name: string; email: string; company: string; message: string;
      namePlaceholder: string; emailPlaceholder: string;
      companyPlaceholder: string; messagePlaceholder: string;
    };
    requiredNote: string;
    serviceMessage: (service: string) => string;
    errors: { name: string; email: string; emailInvalid: string; message: string };
    submit: string; sending: string; error: string;
    success: { heading: string; description: string };
  };
  footer: {
    tagline: string; productHeading: string; companyHeading: string;
    productLinks: string[]; companyLinks: string[];
    copyright: (year: number) => string; location: string;
  };
  customWork: {
    heading: string;
    description: string;
    items: { title: string; description: string; tags: string[] }[];
  };
  whyCuarzo: { heading: string; body1: string; body2: string; closing: string };
};

const es: T = {
  nav: {
    services: "Servicios",
    whyUs: "Cómo trabajamos",
    custom: "Trabajos puntuales",
    start: "Hablemos",
    menu: "Abrir o cerrar el menú",
    language: "Cambiar idioma",
    skip: "Saltar al contenido"
  },
  pages: {
    home: "Volver al inicio",
    notFound: { title: "Página no encontrada", description: "La página que buscás no existe o fue movida." },
    error: {
      title: "Algo salió mal",
      description: "Ocurrió un error inesperado. Podés intentar recargar la página o volver al inicio.",
      retry: "Intentar de nuevo",
      id: "ID del error"
    }
  },
  hero: {
    heading1: "Software a medida",
    heading2: "para tu",
    heading3: "negocio",
    description: "Desarrollamos tiendas online, sistemas de gestión, integraciones y automatizaciones para PYMEs argentinas. De la primera charla a tu sistema funcionando.",
    ctaPrimary: "Contanos tu proyecto",
    order: { title: "Pedido nuevo", steps: ["Pago recibido", "Envío generado", "Stock actualizado"], done: "Todo en orden" }
  },
  ticker: ["Tiendas online", "Mercado Pago", "Andreani", "Stock", "Clientes", "Órdenes de trabajo", "Reportes", "Identidad gráfica"],
  demos: {
    commerce: ["Cobro", "Mercado Pago", "Andreani"],
    automation: ["Todos los días, 6:00", "Datos cargados", "Reporte listo"]
  },
  services: {
    heading: "Lo que desarrollamos",
    description: "Cada proyecto se hace a la medida de tu proceso, no al revés.",
    items: [
      {
        title: "E-commerce",
        description: "Catálogo, carrito, cobros con Mercado Pago y envíos con Andreani."
      },
      {
        title: "Sistemas de gestión a medida",
        description: "Stock, clientes, órdenes de trabajo, logística y accesos por persona."
      },
      {
        title: "Integraciones",
        description: "Conectamos los sistemas que ya usás para que la información pase de uno a otro."
      },
      {
        title: "Automatizaciones",
        description: "Carga automática de datos, controles y reportes para sacarte tareas repetidas de encima."
      },
      {
        title: "Diseño y contenido visual",
        description: "Identidad gráfica, ilustración, pantallas, piezas para redes, video y animación."
      }
    ]
  },
  values: {
    heading: "Cómo trabajamos",
    description: "Un solo equipo, desde la primera charla hasta la entrega.",
    steps: ["Primera charla", "Cotización", "Desarrollo", "Puesta en marcha"],
    items: [
      {
        title: "Todo el proyecto, con nosotros",
        description: "Nos encargamos de entender el problema, cotizar, construir y publicar."
      },
      {
        title: "A la medida de tu proceso",
        description: "Partimos de cómo trabajás hoy, para que el sistema se adapte a vos."
      },
      {
        title: "Pensado para el día a día",
        description: "Cada conexión y cada proceso, preparados para funcionar todos los días."
      },
      {
        title: "Hecho para Argentina",
        description: "Trabajamos con Mercado Pago, Andreani y los servicios que usás acá."
      }
    ]
  },
  team: {
    heading: "Quiénes somos",
    description: "Dos socios, desarrollo y diseño en el mismo equipo.",
    cv: "Ver CV",
    items: [
      { name: "Pablo Cavillon", role: "Desarrollador Full Stack", bio: "Ingeniero en Informática. Desarrolla sistemas web, APIs e integraciones, y se encarga de cada proyecto desde la primera charla hasta la puesta en marcha.", href: "/cv" },
      { name: "Laura Coreico", role: "Diseñadora multimedial", bio: "Ilustradora que viene del diseño textil. Trabaja entre lo gráfico, lo digital y lo audiovisual: ilustración, piezas para redes, video y animación.", href: "/cv/laura" },
    ],
  },
  contact: {
    heading: "Hablemos de tu próximo proyecto",
    description:
      "Contanos qué necesita tu empresa y te armaremos una propuesta a medida. Te respondemos en 24 horas hábiles, sin compromisos.",
    emailLabel: "Email",
    locationLabel: "Ubicación",
    locationValue: "Mendoza Capital, Argentina",
    whatsappCta: "Escribinos por WhatsApp",
    whatsappMessage: "Hola Cuarzo, quiero contarles sobre un proyecto.",
    fields: {
      name: "Nombre *",
      email: "Email *",
      company: "Empresa",
      message: "Mensaje *",
      namePlaceholder: "Nombre y apellido",
      emailPlaceholder: "nombre@tuempresa.com",
      companyPlaceholder: "Opcional",
      messagePlaceholder: "A qué se dedica tu negocio y qué te gustaría resolver",
    },
    requiredNote: "* Obligatorio",
    serviceMessage: (service) => `Me interesa: ${service}.\n\n`,
    errors: {
      name: "Escribí tu nombre.",
      email: "Escribí tu email para que podamos responderte.",
      emailInvalid: "Revisá el email: debería verse como nombre@tuempresa.com.",
      message: "Contanos qué necesitás.",
    },
    submit: "Enviar mensaje",
    sending: "Enviando...",
    error: "No pudimos enviar tu mensaje. Tu texto sigue acá: probá de nuevo o escribinos por otro medio.",
    success: {
      heading: "¡Mensaje enviado!",
      description: "Te respondemos en 24 horas hábiles. Si es urgente, escribinos por WhatsApp.",
    },
  },
  footer: {
    tagline: "Desarrollo de software a medida para emprendedores y PYMEs argentinas.",
    productHeading: "Servicios",
    companyHeading: "Empresa",
    productLinks: [
      "E-commerce",
      "Sistemas de gestión",
      "Integraciones",
      "Automatizaciones",
      "Diseño"
    ],
    companyLinks: [
      "Sobre nosotros",
      "CV",
      "Contacto"
    ],
    location: "Mendoza · Argentina",
    copyright: (year: number) => `© ${year} Cuarzo. Todos los derechos reservados.`,
  },
  whyCuarzo: {
    heading: "El nombre no es casualidad",
    body1: "El cuarzo está en cada dispositivo que usás: en tu celular, en tu computadora, en el reloj de tu mano. Es el mineral que sincroniza la tecnología moderna: invisible, preciso, indispensable.",
    body2: "Así pensamos nuestro trabajo. La tienda que cobra sola, el sistema que ordena tu operación, la automatización que te saca una tarea repetida. No lo ves hasta que no está. Y cuando está, todo funciona.",
    closing: "La base invisible que sostiene tu negocio."
  },
  customWork: {
    heading: "¿Necesitás algo específico?",
    description: "También trabajamos en proyectos puntuales. Si tenés una necesidad concreta, hablemos.",
    items: [
      {
        title: "CV Profesional",
        description: "Diseño y redacción de tu CV, con una estructura clara, orientado a resultados y preparado para los filtros automáticos de las búsquedas laborales.",
        tags: [
          "Redacción",
          "Diseño",
          "Búsquedas laborales"
        ]
      },
      {
        title: "Consultoría técnica",
        description: "Revisamos tu sistema y su código, te ayudamos a elegir tecnologías y acompañamos a tu equipo técnico.",
        tags: [
          "Revisión de sistemas",
          "Elección de tecnologías",
          "Mentoría"
        ]
      },
      {
        title: "Dominio y mail corporativo",
        description: "Registramos y administramos tu dominio empresarial (.com, .com.ar y más) y configuramos tus cuentas @tuempresa.com. Como hicimos con projaska.com.",
        tags: [
          "Dominio",
          "Configuración",
          "Mail corporativo"
        ]
      }
    ]
  },
};

const en: T = {
  nav: {
    services: "Services",
    whyUs: "How we work",
    custom: "One-off projects",
    start: "Let's talk",
    menu: "Open or close the menu",
    language: "Change language",
    skip: "Skip to content"
  },
  pages: {
    home: "Back to home",
    notFound: { title: "Page not found", description: "The page you're looking for doesn't exist or was moved." },
    error: {
      title: "Something went wrong",
      description: "An unexpected error occurred. You can try reloading the page or go back to home.",
      retry: "Try again",
      id: "Error ID"
    }
  },
  hero: {
    heading1: "Custom software",
    heading2: "for your",
    heading3: "business",
    description: "We build online stores, management systems, integrations and automations for small businesses in Argentina. From the first conversation to your system up and running.",
    ctaPrimary: "Tell us about your project",
    order: { title: "New order", steps: ["Payment received", "Shipment created", "Stock updated"], done: "All set" }
  },
  ticker: ["Online stores", "Mercado Pago", "Andreani", "Inventory", "Customers", "Work orders", "Reports", "Graphic identity"],
  demos: {
    commerce: ["Payment", "Mercado Pago", "Andreani"],
    automation: ["Every day, 6:00", "Data loaded", "Report ready"]
  },
  services: {
    heading: "What we build",
    description: "Every project is shaped around your process, not the other way around.",
    items: [
      {
        title: "E-commerce",
        description: "Catalog, cart, Mercado Pago payments and Andreani shipping."
      },
      {
        title: "Custom management systems",
        description: "Inventory, customers, work orders, logistics and per-person access."
      },
      {
        title: "Integrations",
        description: "We connect the systems you already use so information flows from one to the other."
      },
      {
        title: "Automation",
        description: "Automatic data entry, checks and reports that take repetitive work off your plate."
      },
      {
        title: "Design and visual content",
        description: "Graphic identity, illustration, screens, social media pieces, video and animation."
      }
    ]
  },
  values: {
    heading: "How we work",
    description: "One team, from the first conversation to delivery.",
    steps: ["First conversation", "Quote", "Development", "Launch"],
    items: [
      {
        title: "The whole project, with us",
        description: "We take care of understanding the problem, quoting, building and launching."
      },
      {
        title: "Shaped around your process",
        description: "We start from how you work today, so the system fits you."
      },
      {
        title: "Built for everyday use",
        description: "Every connection and every process, ready to work every day."
      },
      {
        title: "Made for Argentina",
        description: "We work with Mercado Pago, Andreani and the services you use here."
      }
    ]
  },
  team: {
    heading: "Who we are",
    description: "Two partners, development and design on the same team.",
    cv: "View CV",
    items: [
      { name: "Pablo Cavillon", role: "Full Stack Developer", bio: "Computer engineer. He builds web systems, APIs and integrations, and handles each project from the first conversation to launch.", href: "/cv" },
      { name: "Laura Coreico", role: "Multimedia designer", bio: "Illustrator with a background in textile design. She works across graphic, digital and audiovisual: illustration, social media pieces, video and animation.", href: "/cv/laura" },
    ],
  },
  contact: {
    heading: "Let's talk about your next project",
    description:
      "Tell us what your company needs and we'll build a tailored proposal. We reply within 24 business hours, no commitment.",
    emailLabel: "Email",
    locationLabel: "Location",
    locationValue: "Mendoza City, Argentina",
    whatsappCta: "Message us on WhatsApp",
    whatsappMessage: "Hi Cuarzo, I'd like to tell you about a project.",
    fields: {
      name: "Name *",
      email: "Email *",
      company: "Company",
      message: "Message *",
      namePlaceholder: "First and last name",
      emailPlaceholder: "name@yourcompany.com",
      companyPlaceholder: "Optional",
      messagePlaceholder: "What your business does and what you'd like to solve",
    },
    requiredNote: "* Required",
    serviceMessage: (service) => `I'm interested in: ${service}.\n\n`,
    errors: {
      name: "Enter your name.",
      email: "Enter your email so we can reply.",
      emailInvalid: "Check your email: it should look like name@yourcompany.com.",
      message: "Tell us what you need.",
    },
    submit: "Send message",
    sending: "Sending...",
    error: "We couldn't send your message. Your text is still here: try again or reach us another way.",
    success: {
      heading: "Message sent!",
      description: "We'll reply within 24 business hours. If it's urgent, message us on WhatsApp.",
    },
  },
  footer: {
    tagline: "Custom software development for entrepreneurs and small businesses in Argentina.",
    productHeading: "Services",
    companyHeading: "Company",
    productLinks: [
      "E-commerce",
      "Management systems",
      "Integrations",
      "Automation",
      "Design"
    ],
    companyLinks: [
      "About us",
      "CV",
      "Contact"
    ],
    location: "Mendoza · Argentina",
    copyright: (year: number) => `© ${year} Cuarzo. All rights reserved.`,
  },
  whyCuarzo: {
    heading: "The name is no accident",
    body1: "Quartz is in every device you use: in your phone, in your computer, in the watch on your wrist. It's the mineral that keeps modern technology in sync: invisible, precise, indispensable.",
    body2: "That's how we think about our work. The store that takes payments on its own, the system that keeps your operation in order, the automation that removes a repetitive task. You don't see it until it's gone. And when it's there, everything works.",
    closing: "The invisible foundation that holds up your business."
  },
  customWork: {
    heading: "Need something specific?",
    description: "We also take on one-off projects. If you have a concrete need, let's talk.",
    items: [
      {
        title: "Professional CV",
        description: "Design and writing of your resume, with a clear structure, a focus on results and ready for the automatic filters of job searches.",
        tags: [
          "Writing",
          "Design",
          "Job searches"
        ]
      },
      {
        title: "Technical consulting",
        description: "We review your system and its code, help you choose technologies and support your technical team.",
        tags: [
          "System reviews",
          "Choosing technologies",
          "Mentoring"
        ]
      },
      {
        title: "Domain and corporate email",
        description: "We register and manage your business domain (.com, .com.ar and more) and set up your @yourcompany.com accounts. Like we did with projaska.com.",
        tags: [
          "Domain",
          "Setup",
          "Corporate email"
        ]
      }
    ]
  },
};

const pt: T = {
  nav: {
    services: "Serviços",
    whyUs: "Como trabalhamos",
    custom: "Projetos pontuais",
    start: "Vamos falar",
    menu: "Abrir ou fechar o menu",
    language: "Mudar idioma",
    skip: "Pular para o conteúdo"
  },
  pages: {
    home: "Voltar ao início",
    notFound: { title: "Página não encontrada", description: "A página que você procura não existe ou foi movida." },
    error: {
      title: "Algo deu errado",
      description: "Ocorreu um erro inesperado. Você pode tentar recarregar a página ou voltar ao início.",
      retry: "Tentar de novo",
      id: "ID do erro"
    }
  },
  hero: {
    heading1: "Software sob medida",
    heading2: "para o seu",
    heading3: "negócio",
    description: "Desenvolvemos lojas online, sistemas de gestão, integrações e automações para pequenas empresas na Argentina. Da primeira conversa ao seu sistema funcionando.",
    ctaPrimary: "Conte seu projeto",
    order: { title: "Novo pedido", steps: ["Pagamento recebido", "Envio gerado", "Estoque atualizado"], done: "Tudo certo" }
  },
  ticker: ["Lojas online", "Mercado Pago", "Andreani", "Estoque", "Clientes", "Ordens de serviço", "Relatórios", "Identidade gráfica"],
  demos: {
    commerce: ["Pagamento", "Mercado Pago", "Andreani"],
    automation: ["Todos os dias, 6:00", "Dados carregados", "Relatório pronto"]
  },
  services: {
    heading: "O que desenvolvemos",
    description: "Cada projeto é feito sob medida para o seu processo, não o contrário.",
    items: [
      {
        title: "E-commerce",
        description: "Catálogo, carrinho, pagamentos com Mercado Pago e envios com Andreani."
      },
      {
        title: "Sistemas de gestão sob medida",
        description: "Estoque, clientes, ordens de serviço, logística e acessos por pessoa."
      },
      {
        title: "Integrações",
        description: "Conectamos os sistemas que você já usa para que a informação passe de um para o outro."
      },
      {
        title: "Automações",
        description: "Carga automática de dados, controles e relatórios que tiram tarefas repetitivas do seu dia."
      },
      {
        title: "Design e conteúdo visual",
        description: "Identidade gráfica, ilustração, telas, peças para redes, vídeo e animação."
      }
    ]
  },
  values: {
    heading: "Como trabalhamos",
    description: "Uma só equipe, da primeira conversa até a entrega.",
    steps: ["Primeira conversa", "Orçamento", "Desenvolvimento", "Lançamento"],
    items: [
      {
        title: "Todo o projeto, com a gente",
        description: "Cuidamos de entender o problema, orçar, construir e publicar."
      },
      {
        title: "Sob medida para o seu processo",
        description: "Partimos de como você trabalha hoje, para que o sistema se adapte a você."
      },
      {
        title: "Pensado para o dia a dia",
        description: "Cada conexão e cada processo, preparados para funcionar todos os dias."
      },
      {
        title: "Feito para a Argentina",
        description: "Trabalhamos com Mercado Pago, Andreani e os serviços que você usa aqui."
      }
    ]
  },
  team: {
    heading: "Quem somos",
    description: "Dois sócios, desenvolvimento e design na mesma equipe.",
    cv: "Ver CV",
    items: [
      { name: "Pablo Cavillon", role: "Desenvolvedor Full Stack", bio: "Engenheiro de informática. Desenvolve sistemas web, APIs e integrações, e cuida de cada projeto da primeira conversa até o sistema funcionando.", href: "/cv" },
      { name: "Laura Coreico", role: "Designer multimídia", bio: "Ilustradora com formação em design têxtil. Trabalha entre o gráfico, o digital e o audiovisual: ilustração, peças para redes, vídeo e animação.", href: "/cv/laura" },
    ],
  },
  contact: {
    heading: "Vamos falar sobre seu próximo projeto",
    description:
      "Conte-nos o que sua empresa precisa e montaremos uma proposta personalizada. Respondemos em 24 horas úteis, sem compromisso.",
    emailLabel: "E-mail",
    locationLabel: "Localização",
    locationValue: "Mendoza Capital, Argentina",
    whatsappCta: "Fale conosco no WhatsApp",
    whatsappMessage: "Olá, Cuarzo! Quero contar sobre um projeto.",
    fields: {
      name: "Nome *",
      email: "E-mail *",
      company: "Empresa",
      message: "Mensagem *",
      namePlaceholder: "Nome e sobrenome",
      emailPlaceholder: "nome@suaempresa.com",
      companyPlaceholder: "Opcional",
      messagePlaceholder: "O que o seu negócio faz e o que você gostaria de resolver",
    },
    requiredNote: "* Obrigatório",
    serviceMessage: (service) => `Tenho interesse em: ${service}.\n\n`,
    errors: {
      name: "Escreva seu nome.",
      email: "Escreva seu e-mail para podermos responder.",
      emailInvalid: "Confira o e-mail: ele deve ser como nome@suaempresa.com.",
      message: "Conte o que você precisa.",
    },
    submit: "Enviar mensagem",
    sending: "Enviando...",
    error: "Não foi possível enviar sua mensagem. Seu texto continua aqui: tente novamente ou fale conosco por outro meio.",
    success: {
      heading: "Mensagem enviada!",
      description: "Respondemos em 24 horas úteis. Se for urgente, fale conosco no WhatsApp.",
    },
  },
  footer: {
    tagline: "Desenvolvimento de software sob medida para empreendedores e pequenas empresas na Argentina.",
    productHeading: "Serviços",
    companyHeading: "Empresa",
    productLinks: [
      "E-commerce",
      "Sistemas de gestão",
      "Integrações",
      "Automações",
      "Design"
    ],
    companyLinks: [
      "Sobre nós",
      "CV",
      "Contato"
    ],
    location: "Mendoza · Argentina",
    copyright: (year: number) => `© ${year} Cuarzo. Todos os direitos reservados.`,
  },
  whyCuarzo: {
    heading: "O nome não é por acaso",
    body1: "O quartzo está em todos os dispositivos que você usa: no seu celular, no seu computador, no relógio do seu pulso. É o mineral que sincroniza a tecnologia moderna: invisível, preciso, indispensável.",
    body2: "É assim que pensamos nosso trabalho. A loja que recebe sozinha, o sistema que organiza sua operação, a automação que tira uma tarefa repetitiva. Você não vê até que falte. E quando está lá, tudo funciona.",
    closing: "A base invisível que sustenta seu negócio."
  },
  customWork: {
    heading: "Precisa de algo específico?",
    description: "Também trabalhamos em projetos pontuais. Se você tem uma necessidade concreta, vamos conversar.",
    items: [
      {
        title: "CV Profissional",
        description: "Design e redação do seu currículo, com estrutura clara, orientado a resultados e preparado para os filtros automáticos das buscas de emprego.",
        tags: [
          "Redação",
          "Design",
          "Buscas de emprego"
        ]
      },
      {
        title: "Consultoria técnica",
        description: "Revisamos seu sistema e o código dele, ajudamos a escolher tecnologias e acompanhamos sua equipe técnica.",
        tags: [
          "Revisão de sistemas",
          "Escolha de tecnologias",
          "Mentoria"
        ]
      },
      {
        title: "Domínio e e-mail corporativo",
        description: "Registramos e administramos seu domínio empresarial (.com, .com.ar e mais) e configuramos suas contas @suaempresa.com. Como fizemos com projaska.com.",
        tags: [
          "Domínio",
          "Configuração",
          "E-mail corporativo"
        ]
      }
    ]
  },
};

export const translations: Record<Locale, T> = { es, en, pt };
