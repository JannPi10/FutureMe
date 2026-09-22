import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conoce la historia de FutureMe by Leidy Sabata',
}

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-cream py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-rosa-petalo text-sm uppercase tracking-widest mb-4">Nuestra Historia</p>
          <h1 className="font-serif text-5xl md:text-6xl text-carbon mb-6">
            FutureMe
          </h1>
          <p className="text-gris-calido italic font-serif text-xl">
            by Leidy Sabata
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-serif text-3xl text-carbon mb-6">¿Quiénes somos?</h2>
            <p className="text-gris-calido leading-relaxed mb-4">
              FutureMe nace de la pasión por la moda y el deseo de hacer que cada persona se sienta 
              especial y única a través de la ropa. Somos una marca colombiana que cree que el estilo 
              no tiene límites de género ni edad.
            </p>
            <p className="text-gris-calido leading-relaxed mb-4">
              Nuestra colección abarca ropa para mujer, hombre, niños y accesorios, siempre con 
              diseños modernos, materiales cómodos y precios accesibles.
            </p>
            <p className="text-gris-calido leading-relaxed">
              Cada prenda es seleccionada con amor y cuidado para que te sientas bien, 
              te veas increíble y expreses quién eres.
            </p>
          </div>
          <div className="bg-rosa-tulip/20 rounded-sm aspect-square flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-8xl mb-4">🌸</div>
              <p className="font-serif text-carbon text-xl italic">"Moda que florece contigo"</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-gris-claro pt-16">
          <h2 className="font-serif text-3xl text-carbon text-center mb-12">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '✨', title: 'Calidad', desc: 'Seleccionamos cada prenda con los más altos estándares de calidad y durabilidad.' },
              { icon: '💝', title: 'Inclusividad', desc: 'Moda para todos: mujer, hombre y niños, en todas las tallas y estilos.' },
              { icon: '🌱', title: 'Compromiso', desc: 'Nos comprometemos con la satisfacción de nuestros clientes en cada pedido.' },
            ].map((value) => (
              <div key={value.title} className="text-center p-6 bg-cream rounded-sm">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-serif text-xl text-carbon mb-3">{value.title}</h3>
                <p className="text-gris-calido text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 py-12 bg-rosa-tulip/10 rounded-sm">
          <h2 className="font-serif text-3xl text-carbon mb-4">¿Lista para explorar?</h2>
          <p className="text-gris-calido mb-8">Descubre nuestra colección completa</p>
          <Link href="/productos" className="btn-primary">
            Ver Colección
          </Link>
        </div>
      </div>
    </div>
  )
}
