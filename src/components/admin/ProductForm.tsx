'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiUploadCloud, FiCheck, FiLink } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const TALLAS_ADULTOS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Única'];
const TALLAS_NINOS = ['2', '4', '6', '8', '10', '12', '14', '16'];

const DEPARTAMENTOS_PADRE = [
  { id: 'mujer', label: 'Mujer', icon: '🌸', desc: 'Vestidos, blusas, pantalones, etc.' },
  { id: 'hombre', label: 'Hombre', icon: '👔', desc: 'Camisetas, pantalones, etc.' },
  { id: 'nino', label: 'Infantil', icon: '🧸', desc: 'Ropa niña, niño, pijamas' },
  { id: 'accesorio', label: 'Accesorios', icon: '👜', desc: 'Bolsos, mochilas, detalles' },
];

export default function ProductForm({ producto, onSubmit, loading }: any) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: producto || {
      activo: true,
      destacado: false,
      nuevo: true,
      tallas: [],
      colores: [],
      imagenes: [],
      stock: 10,
    }
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedGenero, setSelectedGenero] = useState<string>('mujer');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const router = useRouter();

  const [colores, setColores] = useState<any[]>(producto?.colores || []);
  const [imagenes, setImagenes] = useState<string[]>(producto?.imagenes?.filter(Boolean) || []);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cargar categorías disponibles
  useEffect(() => {
    fetch('/api/categorias', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        const list = Array.isArray(json) ? json : (json?.data || []);
        setCategories(list);

        // Si estamos editando un producto, sincronizar el departamento padre
        if (producto?.categoria_id) {
          const matched = list.find((c: any) => c.id === producto.categoria_id);
          if (matched?.genero) {
            setSelectedGenero(matched.genero);
          }
        }
      })
      .catch(() => setCategories([]));
  }, [producto]);

  // Generación automática del enlace web (slug) a partir del nombre
  const nombre = watch('nombre');
  const currentSlug = watch('slug');

  useEffect(() => {
    if (nombre && (!producto || !currentSlug)) {
      setValue('slug', slugify(nombre));
    }
  }, [nombre, producto, currentSlug, setValue]);

  // Manejar cambio de departamento padre
  const handleSelectGenero = (generoId: string) => {
    setSelectedGenero(generoId);
    const subcats = categories.filter((c: any) => c.genero === generoId);
    if (subcats.length > 0) {
      setValue('categoria_id', subcats[0].id);
    } else {
      setValue('categoria_id', '');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const toastId = toast.loading('Subiendo imagen(es) al servidor...');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            uploadedUrls.push(json.url);
          }
        } else {
          toast.error(`Error al subir ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setImagenes(prev => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} imagen(es) guardada(s)`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error('Error de red al subir la imagen', { id: toastId });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddColor = () => setColores([...colores, { nombre: '', hex: '#000000' }]);
  const handleRemoveColor = (index: number) => setColores(colores.filter((_, i) => i !== index));
  const updateColor = (index: number, key: string, val: string) => {
    const newColores = [...colores];
    newColores[index][key] = val;
    setColores(newColores);
  };

  const handleRemoveImage = (index: number) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const internalSubmit = (data: any) => {
    // Asegurar que slug nunca sea nulo o vacío
    const finalSlug = data.slug || slugify(data.nombre || 'prenda');
    onSubmit({ 
      ...data, 
      slug: finalSlug,
      colores, 
      imagenes: imagenes.filter(Boolean) 
    });
  };

  const filteredCategories = categories.filter((c: any) => c.genero === selectedGenero);

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-6">
        
        {/* ========================================================
            SECCIÓN 1: DATOS BÁSICOS & ENLACE AUTOMÁTICO
        ======================================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-carbon">Información General</h3>
          
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-6 sm:gap-x-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Nombre de la Prenda o Producto *
              </label>
              <input 
                type="text" 
                placeholder="Ej. Vestido de Gala en Satén Rosa"
                {...register('nombre', { required: true })} 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rosa-tulip text-sm font-medium" 
              />
              
              {/* Enlace Web Automático (Explicación amigable sin jerga técnica) */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <p className="text-gray-500 flex items-center gap-1.5 font-mono">
                  <FiLink className="text-rosa-petalo" size={13} />
                  <span>Enlace web en la tienda:</span>
                  <span className="text-carbon font-semibold bg-gray-100 px-2 py-0.5 rounded">
                    /productos/{watch('slug') || slugify(nombre || 'nombre-de-la-prenda')}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomSlug(!showCustomSlug)}
                  className="text-gray-400 hover:text-carbon text-[11px] underline"
                >
                  {showCustomSlug ? 'Ocultar personalización de enlace' : 'Personalizar enlace web'}
                </button>
              </div>

              {showCustomSlug && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-xs text-gray-600 mb-1">
                    Dirección web personalizada (solo letras minúsculas y guiones):
                  </label>
                  <input 
                    type="text" 
                    {...register('slug')} 
                    className="w-full border border-gray-300 rounded-md py-1.5 px-3 text-xs font-mono" 
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Descripción Detallada
              </label>
              <textarea 
                rows={3} 
                placeholder="Describe la tela, el corte, la ocasión de uso o detalles especiales de la prenda..."
                {...register('descripcion')} 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rosa-tulip text-sm resize-none" 
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            SECCIÓN 2: JERARQUÍA DE CATEGORÍAS (PADRE E HIJA)
        ======================================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-carbon">Categorización de la Prenda</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Organiza la prenda para que tus clientas la encuentren fácilmente en la tienda.
            </p>
          </div>

          {/* PASO 1: Categoría Padre / Departamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Paso 1: ¿A quién va dirigida? (Categoría Principal) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEPARTAMENTOS_PADRE.map((dept) => {
                const isSelected = selectedGenero === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectGenero(dept.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-carbon bg-carbon text-white shadow-md ring-2 ring-carbon/20'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-carbon'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-2xl">{dept.icon}</span>
                      {isSelected && <FiCheck className="text-rosa-tulip" size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{dept.label}</p>
                      <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {dept.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: Categoría Hija / Tipo de prenda */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Paso 2: ¿Qué tipo de prenda es? (Subcategoría) *
            </label>
            <div className="max-w-md">
              <select 
                {...register('categoria_id', { required: true })} 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rosa-tulip text-sm bg-white"
              >
                <option value="">Selecciona el tipo de prenda...</option>
                {filteredCategories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {filteredCategories.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No hay subcategorías creadas para este departamento. Puedes crear una en la sección "Categorías".
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECCIÓN 3: PRECIOS & INVENTARIO
        ======================================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-carbon">Precios e Inventario</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Precio de Venta ($ COP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input 
                  type="number" 
                  placeholder="85000"
                  {...register('precio', { required: true, valueAsNumber: true })} 
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-rosa-tulip font-semibold" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Precio Anterior (Opcional - Para Descuentos)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input 
                  type="number" 
                  placeholder="110000"
                  {...register('precio_anterior', { valueAsNumber: true })} 
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-rosa-tulip text-gray-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Unidades en Inventario (Stock) *
              </label>
              <input 
                type="number" 
                placeholder="10"
                {...register('stock', { valueAsNumber: true })} 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-rosa-tulip font-semibold" 
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            SECCIÓN 4: FOTOS DEL PRODUCTO
        ======================================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-carbon">Fotos de la Prenda</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Sube las fotos tomadas a la prenda. Puedes seleccionar varias al mismo tiempo.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-rosa-petalo transition-colors bg-gray-50/50">
            <input
              type="file"
              id="file-upload-input"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-rosa-tulip/30 text-rosa-petalo flex items-center justify-center">
                <FiUploadCloud size={26} />
              </div>
              <span className="text-sm font-semibold text-carbon">
                {uploadingImage ? 'Subiendo imagen(es) a la nube...' : 'Haz clic para seleccionar fotos desde tu computador o celular'}
              </span>
              <span className="text-xs text-gray-400">
                Formatos permitidos: JPG, PNG, WEBP (sin límite de fotos por prenda)
              </span>
            </label>
          </div>

          {/* Galería de imágenes cargadas */}
          {imagenes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {imagenes.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group bg-white shadow-xs">
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1.5 rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                    title="Eliminar foto"
                  >
                    <FiTrash2 size={13} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-carbon/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      Portada
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No has seleccionado fotos para esta prenda.</p>
          )}
        </div>

        {/* ========================================================
            SECCIÓN 5: TALLAS Y COLORES
        ======================================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-carbon">Tallas y Variantes</h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Tallas Disponibles para esta Prenda
            </label>
            
            {/* Tallas Adultos */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Para Adultos (Mujer / Hombre):</p>
              <div className="flex flex-wrap gap-2">
                {TALLAS_ADULTOS.map(t => (
                  <label 
                    key={t} 
                    className="cursor-pointer border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-carbon hover:bg-rosa-tulip/20 has-checked:bg-carbon has-checked:text-white has-checked:border-carbon transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      value={t} 
                      {...register('tallas')} 
                      className="hidden" 
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tallas Niños */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Para Niñas / Niños:</p>
              <div className="flex flex-wrap gap-2">
                {TALLAS_NINOS.map(t => (
                  <label 
                    key={t} 
                    className="cursor-pointer border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-carbon hover:bg-rosa-tulip/20 has-checked:bg-carbon has-checked:text-white has-checked:border-carbon transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      value={t} 
                      {...register('tallas')} 
                      className="hidden" 
                    />
                    <span>Talla {t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Colores */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Colores Disponibles
              </label>
              <button 
                type="button" 
                onClick={handleAddColor} 
                className="text-xs font-bold text-rosa-petalo flex items-center gap-1 hover:underline"
              >
                <FiPlus size={14} /> Añadir Color
              </button>
            </div>
            
            {colores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {colores.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <input 
                      type="color" 
                      value={c.hex} 
                      onChange={e => updateColor(i, 'hex', e.target.value)} 
                      className="h-8 w-8 rounded cursor-pointer border-0 p-0" 
                    />
                    <input 
                      type="text" 
                      value={c.nombre} 
                      onChange={e => updateColor(i, 'nombre', e.target.value)} 
                      placeholder="Nombre del color (ej. Rosado pastel)" 
                      className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1 text-xs" 
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveColor(i)} 
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No has agregado colores específicos (opcional).</p>
            )}
          </div>
        </div>

        {/* ========================================================
            SECCIÓN 6: VISIBILIDAD & ETIQUETAS
        ======================================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-6 items-center">
          <label className="inline-flex items-center cursor-pointer gap-2 text-sm font-semibold text-carbon">
            <input 
              type="checkbox" 
              {...register('destacado')} 
              className="rounded border-gray-300 text-rosa-petalo focus:ring-rosa-tulip h-4 w-4" 
            />
            <span>⭐ Prenda Destacada (aparece en portada)</span>
          </label>

          <label className="inline-flex items-center cursor-pointer gap-2 text-sm font-semibold text-carbon">
            <input 
              type="checkbox" 
              {...register('nuevo')} 
              className="rounded border-gray-300 text-rosa-petalo focus:ring-rosa-tulip h-4 w-4" 
            />
            <span>✨ Nueva Colección</span>
          </label>

          <label className="inline-flex items-center cursor-pointer gap-2 text-sm font-semibold text-carbon">
            <input 
              type="checkbox" 
              {...register('activo')} 
              className="rounded border-gray-300 text-rosa-petalo focus:ring-rosa-tulip h-4 w-4" 
            />
            <span>🟢 Publicada y Visible para Clientes</span>
          </label>
        </div>

      </div>
      
      {/* Botones de acción */}
      <div className="pt-6 flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/productos')}
          className="px-6 py-3 border border-gray-300 shadow-xs text-xs font-bold uppercase tracking-wider rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="inline-flex justify-center py-3 px-8 border border-transparent shadow-md text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-carbon hover:bg-rosa-petalo focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-carbon disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando prenda...' : (producto ? 'Actualizar Prenda' : 'Publicar Prenda')}
        </button>
      </div>
    </form>
  );
}
