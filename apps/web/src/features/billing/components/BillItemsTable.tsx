import React from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { BillItemCategory } from '@medicalink/shared';

export interface BillItemForm {
  id: string;
  category: BillItemCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
}

interface Props {
  items: BillItemForm[];
  onChange: (items: BillItemForm[]) => void;
}

export const BillItemsTable: React.FC<Props> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: BillItemForm = {
      id: Math.random().toString(36).substr(2, 9),
      category: BillItemCategory.SERVICE,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPct: 0,
      taxRate: 18
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof BillItemForm, value: any) => {
    onChange(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateLineTotal = (item: BillItemForm) => {
    const gross = item.quantity * item.unitPrice;
    const discount = gross * (item.discountPct / 100);
    const amount = gross - discount;
    const tax = amount * (item.taxRate / 100);
    return amount + tax;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-900 flex items-center">
          <Calculator size={18} className="mr-2 text-indigo-500" />
          Bill Items
        </h3>
        <button 
          type="button"
          onClick={handleAdd}
          className="flex items-center text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
        >
          <Plus size={16} className="mr-1" /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 w-1/4">Category & Description</th>
              <th className="px-4 py-3 w-24">Qty</th>
              <th className="px-4 py-3 w-32">Rate (₹)</th>
              <th className="px-4 py-3 w-24">Disc %</th>
              <th className="px-4 py-3 w-24">Tax %</th>
              <th className="px-4 py-3 text-right">Total (₹)</th>
              <th className="px-4 py-3 w-12 text-center">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No items added yet. Click "Add Item" or use Auto-fetch.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <select 
                        value={item.category}
                        onChange={(e) => handleChange(item.id, 'category', e.target.value)}
                        className="w-1/3 rounded-md border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.values(BillItemCategory).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => handleChange(item.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="flex-1 rounded-md border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={item.discountPct}
                      onChange={(e) => handleChange(item.id, 'discountPct', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.taxRate}
                      onChange={(e) => handleChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 bg-slate-50">
                    {calculateLineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
