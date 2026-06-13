import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({ isOpen, onClose }) => {
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ drugId: '', quantity: 1, rate: 0 }]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const addItem = () => setItems([...items, { drugId: '', quantity: 1, rate: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Create Purchase Order</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="create-po-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Supplier *</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">-- Choose a Supplier --</option>
                <option value="sup_1">PharmaCorp Ltd</option>
                <option value="sup_2">MedLife Distributors</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-slate-800">Order Items</h3>
                <button type="button" onClick={addItem} className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 flex items-center">
                  <Plus size={16} className="mr-1" /> Add Item
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 w-1/2">Drug</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Rate ($)</th>
                      <th className="px-4 py-3">Total ($)</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input type="text" placeholder="Search drug..." className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.drugId} onChange={(e) => updateItem(index, 'drugId', e.target.value)} required />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" min="1" className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} required />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" min="0" step="0.01" className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.rate} onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))} required />
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-900">
                          {(item.quantity * item.rate).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1" disabled={items.length === 1}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-medium text-slate-700">Total PO Amount:</td>
                      <td className="px-4 py-3 font-bold text-slate-900 text-lg">${totalAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" form="create-po-form" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
            Generate PO
          </button>
        </div>
      </div>
    </div>
  );
};
