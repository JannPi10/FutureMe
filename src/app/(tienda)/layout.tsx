import AnnouncementBar from '@/components/tienda/AnnouncementBar';
import Navbar from '@/components/tienda/Navbar';
import Footer from '@/components/tienda/Footer';
import SplashScreen from '@/components/tienda/SplashScreen';
import CartDrawer from '@/components/tienda/CartDrawer';
import CheckoutModal from '@/components/tienda/CheckoutModal';
import WhatsAppButton from '@/components/tienda/WhatsAppButton';

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SplashScreen />
      <AnnouncementBar />
      <Navbar />
      
      <main className="min-h-screen bg-tulip-white">
        {children}
      </main>
      
      <Footer />
      
      {/* Global Modals & Fixed Elements */}
      <CartDrawer />
      <CheckoutModal />
      <WhatsAppButton />
    </>
  );
}
