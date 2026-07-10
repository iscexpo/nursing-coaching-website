import { MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/site-data'

export function FloatingWhatsApp() {
  return (
    <a
      href={SITE.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="হোয়াটসঅ্যাপে চ্যাট করুন"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green px-4 py-3 text-green-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden text-sm font-semibold sm:inline">চ্যাট করুন</span>
    </a>
  )
}
