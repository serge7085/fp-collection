"use client";

export default function WhatsAppFloatingButton({
  whatsappUrl,
}: {
  whatsappUrl: string;
}) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp flex items-center justify-center shadow-lg shadow-black/40 hover:scale-105 active:scale-95 transition-transform"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.6 6.32A7.85 7.85 0 0012.05 4 7.94 7.94 0 004.1 11.94c0 1.4.37 2.77 1.07 3.97L4 20l4.2-1.1a7.93 7.93 0 003.85 1h.01a7.94 7.94 0 007.94-7.94 7.9 7.9 0 00-2.4-5.64zm-5.55 12.2h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.49.65.66-2.43-.16-.25a6.58 6.58 0 01-1.01-3.5 6.6 6.6 0 0111.27-4.67 6.55 6.55 0 011.94 4.67 6.6 6.6 0 01-6.6 6.59zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.51.64-.63.77-.12.13-.23.15-.43.05a5.4 5.4 0 01-1.6-.98 5.96 5.96 0 01-1.1-1.37c-.12-.2 0-.3.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.45-1.07-.61-1.47-.16-.38-.33-.33-.45-.34h-.39a.74.74 0 00-.53.25c-.18.2-.7.68-.7 1.65s.72 1.92.82 2.05c.1.13 1.4 2.15 3.4 3.01.47.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z"
          fill="white"
        />
      </svg>
    </a>
  );
}
