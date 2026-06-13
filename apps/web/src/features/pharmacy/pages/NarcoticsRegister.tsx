import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Lock,
  CheckCircle,
  FileText
} from 'lucide-react';
// import { useGetNarcoticsLogQuery } from '../api/pharmacyApi'; // Assuming this will be implemented later

export const NarcoticsRegister: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for now since API endpoint isn't fully defined yet in blueprint for narcotics specific
  const logs = [
    {
      _id: '1',
      date: '2026-06-12T10:30:00Z',
      drugName: 'Morphine Sulfate 10mg/ml',
      batch: 'B-88392',
      transactionType: 'DISPENSE',
      quantityOut: 2,
      quantityIn: 0,
      balance: 48,
      patientName: 'John Doe',
      prescriptionRef: 'RX-9921',
      pharmacistName: 'Jane Smith',
      verifiedByName: 'Dr. Robert Jones',
      status: 'VERIFIED'
    },
    {
      _id: '2',
      date: '2026-06-11T14:15:00Z',
      drugName: 'Fentanyl 50mcg Patch',
      batch: 'F-77211',
      transactionType: 'RECEIPT',
      quantityOut: 0,
      quantityIn: 20,
      balance: 25,
      supplierName: 'PharmaCorp Ltd',
      poRef: 'PO-4412',
      pharmacistName: 'Jane Smith',
      verifiedByName: 'Admin User',
      status: 'VERIFIED'
    }
  ];

  const isLoading = false;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <ShieldAlert className="mr-2 text-red-600" size={28} />
            Narcotics & Controlled Substances Register
          </h1>
          <p className="text-slate-500 mt-1">Strictly monitored log for Schedule H/X and Narcotic drugs</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center">
            <Download size={18} className="mr-2" /> Export Register
          </button>
          <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-sm shadow-red-200">
            <Lock size={18} className="mr-2" /> Verify Daily Balance
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by drug name, patient, or RX number..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center">
            <Filter size={18} className="mr-2" /> Filter By Date
          </button>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Drug Details</th>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4 text-center">In</th>
                <th className="px-6 py-4 text-center">Out</th>
                <th className="px-6 py-4 text-center font-bold text-slate-900">Balance</th>
                <th className="px-6 py-4">Signatures (Double)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading register...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                    <FileText size={32} className="text-slate-300 mb-3" />
                    <p>No narcotic transactions found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{new Date(log.date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{new Date(log.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-red-700">{log.drugName}</div>
                      <div className="text-xs text-slate-500">Batch: {log.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mb-1 ${log.transactionType === 'DISPENSE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {log.transactionType}
                      </span>
                      <div className="text-xs text-slate-600">
                        {log.transactionType === 'DISPENSE' 
                          ? `Pt: ${log.patientName} (${log.prescriptionRef})` 
                          : `From: ${log.supplierName} (${log.poRef})`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-emerald-600">
                      {log.quantityIn > 0 ? `+${log.quantityIn}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-amber-600">
                      {log.quantityOut > 0 ? `-${log.quantityOut}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900 bg-slate-50/50">
                      {log.balance}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center text-slate-700">
                          <CheckCircle size={12} className="text-emerald-500 mr-1" />
                          <span>1: {log.pharmacistName}</span>
                        </div>
                        <div className="flex items-center text-slate-700">
                          <CheckCircle size={12} className="text-emerald-500 mr-1" />
                          <span>2: {log.verifiedByName}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
        <ShieldAlert className="text-red-600 mt-0.5 mr-3 shrink-0" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-red-900">Regulatory Compliance Notice</h4>
          <p className="text-xs text-red-700 mt-1">
            This digital register is maintained in accordance with national narcotic control regulations. 
            All entries are immutable and require two-factor verification. Daily physical stock verification is mandatory.
          </p>
        </div>
      </div>
    </div>
  );
};
