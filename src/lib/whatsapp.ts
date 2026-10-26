export function normalizeWhatsAppNumber(phone: string): string {
    return phone.replace(/[^\d]/g, '');
}

export function createWhatsAppUrl(phone: string, message: string): string {
    const normalized = normalizeWhatsAppNumber(phone);
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
