/**
 * Utilidad universal para enlaces y apertura de WhatsApp sin corrupción de emojis.
 * En computadores de escritorio abre directamente web.whatsapp.com para evitar
 * la pantalla intermedia de Meta (api.whatsapp.com) que convierte los emojis UTF-8 en rombos ().
 * En dispositivos móviles abre directamente la aplicación nativa de WhatsApp (whatsapp://).
 */

export function formatWhatsAppPhone(phone: string): string {
  let clean = (phone || '573209728606').replace(/\D/g, '');
  if (!clean) clean = '573209728606';
  // Si tiene 10 dígitos (formato celular Colombia: 3XXXXXXXXX), anteponer 57
  if (clean.length === 10 && clean.startsWith('3')) {
    clean = '57' + clean;
  }
  return clean;
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
}

export function getWhatsAppUrl(phone?: string, text: string = ''): string {
  const cleanPhone = phone ? formatWhatsAppPhone(phone) : '';
  const params = new URLSearchParams();
  if (cleanPhone) params.set('phone', cleanPhone);
  if (text) params.set('text', text);

  const query = params.toString() ? `?${params.toString()}` : '';

  if (typeof window !== 'undefined' && isMobileDevice()) {
    return `whatsapp://send${query}`;
  }

  // En escritorio o SSR por defecto, usar web.whatsapp.com para evitar el bug del servidor de Meta
  return `https://web.whatsapp.com/send/${query}`;
}

export function openWhatsAppChat(phone?: string, text: string = '') {
  if (typeof window === 'undefined') return;

  const cleanPhone = phone ? formatWhatsAppPhone(phone) : '';
  const params = new URLSearchParams();
  if (cleanPhone) params.set('phone', cleanPhone);
  if (text) params.set('text', text);

  const query = params.toString() ? `?${params.toString()}` : '';

  if (isMobileDevice()) {
    // Intentar abrir la app nativa directamente
    const nativeUrl = `whatsapp://send${query}`;
    window.location.href = nativeUrl;

    // Fallback: Si en 1.5s la app no abrió (por ej. sin app instalada), abrir enlace web
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.open(`https://api.whatsapp.com/send/${query}`, '_blank');
      }
    }, 1500);
  } else {
    // En PC / Escritorio, abrir WhatsApp Web en una pestaña nueva
    const webUrl = `https://web.whatsapp.com/send/${query}`;
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
}
