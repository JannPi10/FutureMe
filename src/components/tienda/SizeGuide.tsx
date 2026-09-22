'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  const [activeTab, setActiveTab] = useState<'mujer' | 'hombre' | 'infantil'>('mujer');

  const tabs = [
    { id: 'mujer', label: 'Mujer' },
    { id: 'hombre', label: 'Hombre' },
    { id: 'infantil', label: 'Infantil' },
  ] as const;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-carbon/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-tulip-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-6 border-b border-cream bg-white">
            <h2 className="font-serif text-2xl md:text-3xl text-carbon">Guía de Tallas</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-rosa-petalo transition-colors">
              <FiX size={24} />
            </button>
          </div>

          <div className="flex border-b border-cream bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                  activeTab === tab.id ? 'text-carbon' : 'text-gray-400 hover:text-carbon'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-rosa-petalo" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Tables */}
            <div className="overflow-x-auto mb-10 border border-cream rounded-sm">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-rosa-tulip text-carbon">
                  <tr>
                    <th className="px-6 py-4 font-bold">Talla</th>
                    {activeTab === 'mujer' && (
                      <>
                        <th className="px-6 py-4 font-bold">Equivalencia</th>
                        <th className="px-6 py-4 font-bold">Pecho (cm)</th>
                        <th className="px-6 py-4 font-bold">Cintura (cm)</th>
                        <th className="px-6 py-4 font-bold">Cadera (cm)</th>
                      </>
                    )}
                    {activeTab === 'hombre' && (
                      <>
                        <th className="px-6 py-4 font-bold">Equivalencia</th>
                        <th className="px-6 py-4 font-bold">Pecho (cm)</th>
                        <th className="px-6 py-4 font-bold">Cintura (cm)</th>
                      </>
                    )}
                    {activeTab === 'infantil' && (
                      <>
                        <th className="px-6 py-4 font-bold">Edad Aprox.</th>
                        <th className="px-6 py-4 font-bold">Estatura (cm)</th>
                        <th className="px-6 py-4 font-bold">Peso (kg)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream bg-white">
                  {activeTab === 'mujer' && [
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
                  {activeTab === 'hombre' && [
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
                  {activeTab === 'infantil' && [
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

            {/* Instructions */}
            <div className="bg-cream/40 p-6 border border-cream rounded-sm">
              <h3 className="font-serif text-xl text-carbon mb-4">Cómo tomar tus medidas</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-rosa-tulip text-carbon rounded-full flex items-center justify-center font-bold text-xs mr-3">1</span>
                  <p><strong>Pecho:</strong> Mide el contorno por la parte más amplia del pecho, manteniendo la cinta métrica horizontal.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-rosa-tulip text-carbon rounded-full flex items-center justify-center font-bold text-xs mr-3">2</span>
                  <p><strong>Cintura:</strong> Mide alrededor de la parte más estrecha de tu cintura natural.</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-rosa-tulip text-carbon rounded-full flex items-center justify-center font-bold text-xs mr-3">3</span>
                  <p><strong>Cadera:</strong> Mide el contorno por la parte más amplia de tus caderas y glúteos.</p>
                </li>
              </ul>
              <p className="mt-4 text-xs text-gray-500 italic">
                * Las medidas son aproximadas y pueden variar ligeramente dependiendo del diseño de la prenda. Si estás entre dos tallas, te recomendamos elegir la más grande para mayor comodidad.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
