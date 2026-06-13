import React, { useState } from 'react';
import { X, CheckSquare, PackageCheck } from 'lucide-react';

interface ReceiveGRNModalProps {
  isOpen: boolean;
  po: any | null;
  onClose: () => void;
}

export const ReceiveGRNModal: React.FC<ReceiveGRNModalProps> = ({ isOpen, po, onClose }) => {
  // In a real app, we'd initialize state based on the PO's expected items
  const [grnItems, setGrnItems] = useState([
    { drugName: 'Paracetamol 500mg', expectedQty: 100, receivedQty: 100, batchNumber: '', expiryDate: '', rackLocation: 'RACK-A1' }
  ]);

  if (!isOpen || !po) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...grnItems];
    (newItems[index] as any)[field] = value;
    setGrnItems(newItems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <PackageCheck className="mr-2 text-indigo-600" /> Receive Goods (GRN)
            </h2>
            <p className="text-sm text-slate-500 mt-1">PO Number: {po.poNumber} | Supplier: {po.supplier?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="grn-form" onSubmit={handleSubmit}>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Drug</th>
                    <th className="px-4 py-3 w-24">Ordered</th>
                    <th className="px-4 py-3 w-32">Received *</th>
                    <th className="px-4 py-3 w-40">Batch Number *</th>
                    <th className="px-4 py-3 w-40">Expiry Date *</th>
                    <th className="px-4 py-3 w-32">Rack Loc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grnItems.map((item, index) => (
                    <tr key={index} className={item.receivedQty !== item.expectedQty ? "bg-amber-50/50" : ""}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.drugName}</td>
                      <td className="px-4 py-3 text-slate-500">{item.expectedQty}</td>
                      <td className="px-4 py-3">
                        <input type="number" min="0" max={item.expectedQty} required className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.receivedQty} onChange={(e) => updateItem(index, 'receivedQty', parseInt(e.target.value))} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" required className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.batchNumber} onChange={(e) => updateItem(index, 'batchNumber', e.target.value)} placeholder="e.g. B-102" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" required className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.expiryDate} onChange={(e) => updateItem(index, 'expiryDate', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-indigo-500/20 focus:border-indigo-500" value={item.rackLocation} onChange={(e) => updateItem(index, 'rackLocation', e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" form="grn-form" className="px-4 py-2 font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm flex items-center">
            <CheckSquare size={18} className="mr-2" /> Confirm Receipt & Update Stock
          </button>
        </div>
      </div>
    </div>
  );
};
