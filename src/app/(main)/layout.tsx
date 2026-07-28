'use client';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import HeaderLayout from '@/components/layout/header/layout';
import FooterLayout from '@/components/layout/footer/page';
import ChatWidgetWrapper from '@/components/chatbot/ChatWidgetWrapper';
import { PageTransition } from '@/components/motion/primitives';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen">
      <div className="flex min-h-screen flex-col">
        <HeaderLayout />
        <main className="flex-1" aria-label="Nội dung chính">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={pathname}>{children}</PageTransition>
          </AnimatePresence>
        </main>
        <FooterLayout />
      </div>

      <ChatWidgetWrapper />
    </div>
  );
}
