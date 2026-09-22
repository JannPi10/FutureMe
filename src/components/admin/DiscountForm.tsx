'use client';

import { useForm } from 'react-hook-form';

export default function DiscountForm({ descuento, onSubmit, loading, onCancel }: any) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: descuento || {
      tipo: 'porcentaje',
      activo: true,
      valor: 10,
      monto_minimo: 0,
      usos_maximos: 100,
    }
  });

  const tipo = watch('tipo');
  const valor = watch('valor');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Código</label>
        <input 
          type="text" 
          {...register('codigo', { required: true })} 
          onChange={(e) => setValue('codigo', e.target.value.toUpperCase())}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm outline-none focus:border-rosa-tulip" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select {...register('tipo')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm outline-none">
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="fijo">Monto Fijo ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor</label>
          <input type="number" {...register('valor', { required: true, valueAsNumber: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm outline-none" />
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 text-center">
        Preview: Este código da {tipo === 'porcentaje' ? `${valor || 0}%` : `$${valor || 0}`} de descuento.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto Mínimo</label>
          <input type="number" {...register('monto_minimo', { valueAsNumber: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Usos Máximos</label>
          <input type="number" {...register('usos_maximos', { valueAsNumber: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha Expiración (Opcional)</label>
        <input type="datetime-local" {...register('fecha_expiracion')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm outline-none" />
      </div>

      <div className="flex items-center">
        <input type="checkbox" {...register('activo')} className="h-4 w-4 rounded border-gray-300 text-rosa-tulip focus:ring-rosa-tulip" />
        <label className="ml-2 block text-sm text-gray-900">Activo</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-carbon hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
