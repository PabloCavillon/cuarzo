export const locales = ["es", "en", "pt"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

// Explicit type so all three locale objects are structurally validated.
export type T = {
  nav: { services: string; whyUs: string; custom: string; start: string };
  hero: {
    heading1: string; heading2: string; heading3: string;
    description: string; ctaPrimary: string; ctaSecondary: string;
  };
  services: {
    heading: string; description: string;
    items: { title: string; description: string }[];
  };
  values: {
    heading: string; description: string;
    items: { title: string; description: string }[];
  };
  team: {
    heading: string; description: string;
    items: { name: string; role: string; bio: string }[];
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
  customWork: {
    heading: string;
    description: string;
    cta: string;
    items: { title: string; description: string; tags: string[] }[];
  };
  whyCuarzo: { heading: string; body1: string; body2: string; closing: string };
};

const es: T = {
  nav: {
    services: "Servicios",
    whyUs: "Cómo trabajamos",
    custom: "Otros trabajos",
    start: "Hablemos"
  },
  hero: {
    heading1: "Software a medida",
    heading2: "para tu",
    heading3: "negocio",
    description: "Desarrollamos tiendas online, sistemas de gestión, integraciones y automatizaciones para PYMEs argentinas. Del relevamiento al deploy.",
    ctaPrimary: "Contanos tu proyecto",
    ctaSecondary: "Ver servicios"
  },
  services: {
    heading: "Lo que desarrollamos",
    description: "Cada proyecto se hace a la medida de tu proceso, no al revés.",
    items: [
      {
        title: "E-commerce",
        description: "Catálogo, carrito, checkout con Mercado Pago y envíos con Andreani."
      },
      {
        title: "Sistemas de gestión a medida",
        description: "Stock, clientes, órdenes de trabajo, logística, roles y permisos."
      },
      {
        title: "APIs e integraciones",
        description: "Backend con Spring Boot o Node.js y conexión con los sistemas que ya usás."
      },
      {
        title: "Automatizaciones",
        description: "Carga automática de datos, controles y reportes para sacarte tareas repetidas de encima."
      },
      {
        title: "Diseño y contenido visual",
        description: "Identidad gráfica, ilustración, interfaces en Figma, piezas para redes, video y motion."
      }
    ]
  },
  values: {
    heading: "Cómo trabajamos",
    description: "Un solo equipo, desde la primera charla hasta la entrega.",
    items: [
      {
        title: "Del relevamiento al deploy",
        description: "Nos encargamos del proyecto completo: entender el problema, cotizar, construir y publicar."
      },
      {
        title: "A la medida de tu proceso",
        description: "Partimos de cómo trabajás hoy, para que el sistema se adapte a vos."
      },
      {
        title: "Precisión técnica",
        description: "Cada integración y cada flujo, pensados para funcionar todos los días."
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
    items: [
      { name: "Pablo Cavillon", role: "Desarrollador Full Stack", bio: "Ingeniero en Informática. Desarrolla sistemas web, APIs e integraciones, y se encarga de cada proyecto desde el relevamiento hasta el deploy." },
      { name: "Laura Coreico", role: "Diseñadora multimedial", bio: "Ilustradora que viene del diseño textil. Trabaja entre lo gráfico, lo digital y lo audiovisual: ilustración, piezas para redes, video y motion." },
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
    tagline: "Desarrollo de software a medida para emprendedores y PYMEs argentinas.",
    productHeading: "Servicios",
    companyHeading: "Empresa",
    productLinks: [
      "E-commerce",
      "Sistemas de gestión",
      "APIs e integraciones",
      "Automatizaciones",
      "Diseño"
    ],
    companyLinks: [
      "Sobre nosotros",
      "CV",
      "Contacto"
    ],
    location: "Buenos Aires · Argentina",
    copyright: (year: number) => `© ${year} Cuarzo. Todos los derechos reservados.`,
  },
  whyCuarzo: {
    heading: "El nombre no es casualidad",
    body1: "El cuarzo está en cada dispositivo que usás: en el oscilador de tu celular, en los procesadores de tu computadora, en el reloj de tu mano. Es el mineral que sincroniza la tecnología moderna — invisible, preciso, indispensable. Sin él, no hay señal de tiempo, no hay cómputo, no hay nada.",
    body2: "Así pensamos nuestro trabajo. La tienda que cobra sola, el sistema que ordena tu operación, la automatización que te saca una tarea repetida. No lo ves hasta que no está. Y cuando está, todo funciona. Tu negocio corre sobre una base que no tenés que pensar — igual que el cuarzo.",
    closing: "La base invisible que sostiene tu negocio."
  },
  customWork: {
    heading: "¿Necesitás algo específico?",
    description: "También trabajamos en proyectos puntuales. Si tenés una necesidad concreta, hablemos.",
    cta: "Consultá sin compromiso",
    items: [
      {
        title: "CV Profesional",
        description: "Diseño y redacción de curriculum vitae optimizado para ATS, con estructura clara y orientado a resultados.",
        tags: [
          "Redacción",
          "Diseño",
          "ATS-friendly"
        ]
      },
      {
        title: "Consultoría técnica",
        description: "Revisión de arquitectura, auditoría de código, definición de stack y acompañamiento técnico de tu equipo.",
        tags: [
          "Arquitectura",
          "Code review",
          "Mentoría"
        ]
      },
      {
        title: "Dominio & Mail corporativo",
        description: "Registramos y administramos tu dominio empresarial (.com, .com.ar y más) y configuramos tus cuentas @tuempresa.com. Como hicimos con projaska.com.",
        tags: [
          "Dominio",
          "DNS",
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
    custom: "Other work",
    start: "Let's talk"
  },
  hero: {
    heading1: "Custom software",
    heading2: "for your",
    heading3: "business",
    description: "We build online stores, management systems, integrations and automations for small businesses in Argentina. From discovery to deployment.",
    ctaPrimary: "Tell us about your project",
    ctaSecondary: "See services"
  },
  services: {
    heading: "What we build",
    description: "Every project is shaped around your process, not the other way around.",
    items: [
      {
        title: "E-commerce",
        description: "Catalog, cart, Mercado Pago checkout and Andreani shipping."
      },
      {
        title: "Custom management systems",
        description: "Inventory, customers, work orders, logistics, roles and permissions."
      },
      {
        title: "APIs and integrations",
        description: "Backends with Spring Boot or Node.js, connected to the systems you already use."
      },
      {
        title: "Automation",
        description: "Automatic data entry, checks and reports that take repetitive work off your plate."
      },
      {
        title: "Design and visual content",
        description: "Graphic identity, illustration, Figma interfaces, social media pieces, video and motion."
      }
    ]
  },
  values: {
    heading: "How we work",
    description: "One team, from the first conversation to delivery.",
    items: [
      {
        title: "From discovery to deployment",
        description: "We handle the whole project: understanding the problem, quoting, building and shipping."
      },
      {
        title: "Shaped around your process",
        description: "We start from how you work today, so the system fits you."
      },
      {
        title: "Technical precision",
        description: "Every integration and every flow, built to work every day."
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
    items: [
      { name: "Pablo Cavillon", role: "Full Stack Developer", bio: "Computer engineer. He builds web systems, APIs and integrations, and handles each project from discovery to deployment." },
      { name: "Laura Coreico", role: "Multimedia designer", bio: "Illustrator with a background in textile design. She works across graphic, digital and audiovisual: illustration, social media pieces, video and motion." },
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
    tagline: "Custom software development for entrepreneurs and small businesses in Argentina.",
    productHeading: "Services",
    companyHeading: "Company",
    productLinks: [
      "E-commerce",
      "Management systems",
      "APIs and integrations",
      "Automation",
      "Design"
    ],
    companyLinks: [
      "About us",
      "CV",
      "Contact"
    ],
    location: "Buenos Aires · Argentina",
    copyright: (year: number) => `© ${year} Cuarzo. All rights reserved.`,
  },
  whyCuarzo: {
    heading: "The name is no accident",
    body1: "Quartz is in every device you use: in your phone's oscillator, in your computer's processors, in the watch on your wrist. It's the mineral that keeps modern technology in sync — invisible, precise, indispensable. Without it, there's no time signal, no computing, nothing.",
    body2: "That's how we think about our work. The store that takes payments on its own, the system that keeps your operation in order, the automation that removes a repetitive task. You don't see it until it's gone. And when it's there, everything works. Your business runs on a foundation you don't have to think about — just like quartz.",
    closing: "The invisible foundation that holds up your business."
  },
  customWork: {
    heading: "Need something specific?",
    description: "We also take on one-off projects. If you have a concrete need, let's talk.",
    cta: "Ask with no commitment",
    items: [
      {
        title: "Professional CV",
        description: "Design and writing of an ATS-optimized resume, with a clear structure and a focus on results.",
        tags: [
          "Writing",
          "Design",
          "ATS-friendly"
        ]
      },
      {
        title: "Technical consulting",
        description: "Architecture review, code audits, stack decisions and technical support for your team.",
        tags: [
          "Architecture",
          "Code review",
          "Mentoring"
        ]
      },
      {
        title: "Domain & corporate email",
        description: "We register and manage your business domain (.com, .com.ar and more) and set up your @yourcompany.com accounts. Like we did with projaska.com.",
        tags: [
          "Domain",
          "DNS",
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
    custom: "Outros trabalhos",
    start: "Vamos conversar"
  },
  hero: {
    heading1: "Software sob medida",
    heading2: "para o seu",
    heading3: "negócio",
    description: "Desenvolvemos lojas online, sistemas de gestão, integrações e automações para pequenas empresas na Argentina. Do levantamento ao deploy.",
    ctaPrimary: "Conte seu projeto",
    ctaSecondary: "Ver serviços"
  },
  services: {
    heading: "O que desenvolvemos",
    description: "Cada projeto é feito sob medida para o seu processo, não o contrário.",
    items: [
      {
        title: "E-commerce",
        description: "Catálogo, carrinho, checkout com Mercado Pago e envios com Andreani."
      },
      {
        title: "Sistemas de gestão sob medida",
        description: "Estoque, clientes, ordens de serviço, logística, funções e permissões."
      },
      {
        title: "APIs e integrações",
        description: "Backend com Spring Boot ou Node.js, conectado aos sistemas que você já usa."
      },
      {
        title: "Automações",
        description: "Carga automática de dados, controles e relatórios que tiram tarefas repetitivas do seu dia."
      },
      {
        title: "Design e conteúdo visual",
        description: "Identidade gráfica, ilustração, interfaces no Figma, peças para redes, vídeo e motion."
      }
    ]
  },
  values: {
    heading: "Como trabalhamos",
    description: "Uma só equipe, da primeira conversa até a entrega.",
    items: [
      {
        title: "Do levantamento ao deploy",
        description: "Cuidamos do projeto completo: entender o problema, orçar, construir e publicar."
      },
      {
        title: "Sob medida para o seu processo",
        description: "Partimos de como você trabalha hoje, para que o sistema se adapte a você."
      },
      {
        title: "Precisão técnica",
        description: "Cada integração e cada fluxo, pensados para funcionar todos os dias."
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
    items: [
      { name: "Pablo Cavillon", role: "Desenvolvedor Full Stack", bio: "Engenheiro de informática. Desenvolve sistemas web, APIs e integrações, e cuida de cada projeto do levantamento ao deploy." },
      { name: "Laura Coreico", role: "Designer multimídia", bio: "Ilustradora com formação em design têxtil. Trabalha entre o gráfico, o digital e o audiovisual: ilustração, peças para redes, vídeo e motion." },
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
    tagline: "Desenvolvimento de software sob medida para empreendedores e pequenas empresas na Argentina.",
    productHeading: "Serviços",
    companyHeading: "Empresa",
    productLinks: [
      "E-commerce",
      "Sistemas de gestão",
      "APIs e integrações",
      "Automações",
      "Design"
    ],
    companyLinks: [
      "Sobre nós",
      "CV",
      "Contato"
    ],
    location: "Buenos Aires · Argentina",
    copyright: (year: number) => `© ${year} Cuarzo. Todos os direitos reservados.`,
  },
  whyCuarzo: {
    heading: "O nome não é por acaso",
    body1: "O quartzo está em todos os dispositivos que você usa: no oscilador do seu celular, nos processadores do seu computador, no relógio do seu pulso. É o mineral que sincroniza a tecnologia moderna — invisível, preciso, indispensável. Sem ele, não há sinal de tempo, não há computação, não há nada.",
    body2: "É assim que pensamos nosso trabalho. A loja que recebe sozinha, o sistema que organiza sua operação, a automação que tira uma tarefa repetitiva. Você não vê até que falte. E quando está lá, tudo funciona. Seu negócio roda sobre uma base em que você não precisa pensar — igual ao quartzo.",
    closing: "A base invisível que sustenta seu negócio."
  },
  customWork: {
    heading: "Precisa de algo específico?",
    description: "Também trabalhamos em projetos pontuais. Se você tem uma necessidade concreta, vamos conversar.",
    cta: "Consulte sem compromisso",
    items: [
      {
        title: "CV Profissional",
        description: "Design e redação de currículo otimizado para ATS, com estrutura clara e orientado a resultados.",
        tags: [
          "Redação",
          "Design",
          "ATS-friendly"
        ]
      },
      {
        title: "Consultoria técnica",
        description: "Revisão de arquitetura, auditoria de código, definição de stack e acompanhamento técnico da sua equipe.",
        tags: [
          "Arquitetura",
          "Code review",
          "Mentoria"
        ]
      },
      {
        title: "Domínio & E-mail corporativo",
        description: "Registramos e administramos seu domínio empresarial (.com, .com.ar e mais) e configuramos suas contas @suaempresa.com. Como fizemos com projaska.com.",
        tags: [
          "Domínio",
          "DNS",
          "E-mail corporativo"
        ]
      }
    ]
  },
};

export const translations: Record<Locale, T> = { es, en, pt };
