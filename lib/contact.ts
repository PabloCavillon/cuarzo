export const EMAIL = "contacto@cuarzostudio.com";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const WHATSAPP_URL = "https://wa.me/5491166565670";
export const WHATSAPP_NUMBER = "11 6656-5670";

export const whatsappUrl = (message: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

// Fired by a service card, so the form can start the message with that service.
export const SERVICE_EVENT = "cuarzo:service";
