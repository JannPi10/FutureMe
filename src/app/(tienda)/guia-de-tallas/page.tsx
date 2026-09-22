import Link from 'next/link';

export default function GuiaTallasPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl text-carbon mb-4">Guía de Tallas</h1>
        <p className="text-gray-600">Encuentra la talla perfecta para ti con nuestra guía de medidas detallada.</p>
        <div className="w-16 h-[2px] bg-rosa-petalo mx-auto mt-6"></div>
      </div>

      <div className="space-y-16">
        {/* Mujer */}
        <section>
          <h2 className="font-serif text-3xl text-carbon mb-6 border-b border-cream pb-2">Mujer</h2>
          <div className="overflow-x-auto border border-cream rounded-sm shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-rosa-tulip text-carbon">
                <tr>
                  <th className="px-6 py-4 font-bold">Talla</th>
                  <th className="px-6 py-4 font-bold">Equivalencia</th>
                  <th className="px-6 py-4 font-bold">Pecho (cm)</th>
                  <th className="px-6 py-4 font-bold">Cintura (cm)</th>
                  <th className="px-6 py-4 font-bold">Cadera (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream bg-white">
                {[
                  { t: 'XS', eq: '32-34', p: '82-86', c: '62-66', cd: '88-92' },
                  { t: 'S', eq: '36-38', p: '86-90', c: '66-70', cd: '92-96' },
                  { t: 'M', eq: '40-42', p: '90-94', c: '70-74', cd: '96-100' },
                  { t: 'L', eq: '44-46', p: '94-100', c: '74-80', cd: '100-106' },
                  { t: 'XL', eq: '48-50', p: '100-106', c: '80-86', cd: '106-112' },
                  { t: 'XXL', eq: '52-54', p: '106-112', c: '86-94', cd: '112-120' },
                ].map((r) => (
                  <tr key={r.t} className="hover:bg-cream/20">
                    <td className="px-6 py-4 font-bold">{r.t}</td>
                    <td className="px-6 py-4">{r.eq}</td>
                    <td className="px-6 py-4 text-gray-500">{r.p}</td>
                    <td className="px-6 py-4 text-gray-500">{r.c}</td>
                    <td className="px-6 py-4 text-gray-500">{r.cd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Hombre */}
        <section>
          <h2 className="font-serif text-3xl text-carbon mb-6 border-b border-cream pb-2">Hombre</h2>
          <div className="overflow-x-auto border border-cream rounded-sm shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-verde-salvia/30 text-carbon">
                <tr>
                  <th className="px-6 py-4 font-bold">Talla</th>
                  <th className="px-6 py-4 font-bold">Equivalencia</th>
                  <th className="px-6 py-4 font-bold">Pecho (cm)</th>
                  <th className="px-6 py-4 font-bold">Cintura (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream bg-white">
                {[
                  { t: 'S', eq: '36-38', p: '92-96', c: '76-80' },
                  { t: 'M', eq: '40-42', p: '96-100', c: '80-84' },
                  { t: 'L', eq: '44-46', p: '100-104', c: '84-88' },
                  { t: 'XL', eq: '48-50', p: '104-110', c: '88-94' },
                  { t: 'XXL', eq: '52-54', p: '110-116', c: '94-100' },
                ].map((r) => (
                  <tr key={r.t} className="hover:bg-cream/20">
                    <td className="px-6 py-4 font-bold">{r.t}</td>
                    <td className="px-6 py-4">{r.eq}</td>
                    <td className="px-6 py-4 text-gray-500">{r.p}</td>
                    <td className="px-6 py-4 text-gray-500">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Infantil */}
        <section>
          <h2 className="font-serif text-3xl text-carbon mb-6 border-b border-cream pb-2">Infantil</h2>
          <div className="overflow-x-auto border border-cream rounded-sm shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-malva/30 text-carbon">
                <tr>
                  <th className="px-6 py-4 font-bold">Talla</th>
                  <th className="px-6 py-4 font-bold">Edad Aprox.</th>
                  <th className="px-6 py-4 font-bold">Estatura (cm)</th>
                  <th className="px-6 py-4 font-bold">Peso (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream bg-white">
                {[
                  { t: '2', e: '2 años', alt: '86-92', p: '12-14' },
                  { t: '4', e: '4 años', alt: '98-104', p: '15-17' },
                  { t: '6', e: '6 años', alt: '110-116', p: '18-21' },
                  { t: '8', e: '8 años', alt: '122-128', p: '22-26' },
                  { t: '10', e: '10 años', alt: '134-140', p: '27-32' },
                  { t: '12', e: '12 años', alt: '146-152', p: '33-38' },
                  { t: '14', e: '14 años', alt: '158-164', p: '39-45' },
                  { t: '16', e: '16 años', alt: '170-176', p: '46-52' },
                ].map((r) => (
                  <tr key={r.t} className="hover:bg-cream/20">
                    <td className="px-6 py-4 font-bold">{r.t}</td>
                    <td className="px-6 py-4">{r.e}</td>
                    <td className="px-6 py-4 text-gray-500">{r.alt}</td>
                    <td className="px-6 py-4 text-gray-500">{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-cream/50 p-8 rounded-sm">
          <h2 className="font-serif text-3xl text-carbon mb-6">Cómo tomar tus medidas</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-rosa-tulip text-carbon rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">1</span>
                <div>
                  <h4 className="font-bold text-carbon text-lg mb-1">Pecho</h4>
                  <p className="text-gray-600 text-sm">Pasa la cinta métrica por la parte más prominente de tu pecho, por debajo de los brazos y a través de los omóplatos, asegurándote de que la cinta esté horizontal.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-rosa-tulip text-carbon rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">2</span>
                <div>
                  <h4 className="font-bold text-carbon text-lg mb-1">Cintura</h4>
                  <p className="text-gray-600 text-sm">Mide alrededor de tu cintura natural, la parte más estrecha del torso, usualmente justo encima del ombligo.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-rosa-tulip text-carbon rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">3</span>
                <div>
                  <h4 className="font-bold text-carbon text-lg mb-1">Cadera</h4>
                  <p className="text-gray-600 text-sm">Ponte de pie con los pies juntos y mide la parte más ancha de tus caderas y glúteos.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-cream p-4 flex items-center justify-center min-h-[300px]">
              <div className="text-center text-gray-400">
                <span className="text-6xl block mb-2">🧍‍♀️</span>
                <p className="text-sm uppercase tracking-widest font-bold">Ilustración de medidas</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 p-4 border border-rosa-petalo/30 bg-rosa-tulip/10 text-sm text-carbon">
            <strong>¿Sigues con dudas?</strong> No te preocupes, si la prenda no te queda como esperabas, tienes 15 días para realizar un cambio. Si necesitas ayuda adicional, contáctanos por WhatsApp.
          </div>
        </section>
      </div>
      
      <div className="text-center mt-12">
        <Link href="/productos" className="inline-block bg-carbon text-white px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-rosa-petalo transition-colors">
          Ir a la Tienda
        </Link>
      </div>
    </div>
  );
}
