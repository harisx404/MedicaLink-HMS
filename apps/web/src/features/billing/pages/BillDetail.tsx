import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  IndianRupee,
  Ban,
  Building,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';
import { 
  useGetBillDetailQuery, 
  useVoidBillMutation,
  useRecordPaymentMutation
} from '../api/billingApi';
import { PaymentModal } from '../components/PaymentModal';
import { BillStatus } from '@medicalink/shared';

export const BillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: billData, isLoading, refetch } = useGetBillDetailQuery(id!);
  const [voidBill, { isLoading: isVoiding }] = useVoidBillMutation();
  const [recordPayment] = useRecordPaymentMutation();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const bill = billData?.data;

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading bill details...</div>;
  }

  if (!bill) {
    return <div className="p-12 text-center text-red-500">Bill not found.</div>;
  }

  const handleVoid = async () => {
    const reason = prompt('Please enter a reason for voiding this bill:');
    if (!reason) return;

    try {
      await voidBill({ id: bill._id!, voidReason: reason }).unwrap();
      alert('Bill voided successfully');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to void bill');
    }
  };

  const handlePayment = async (paymentData: any) => {
    try {
      await recordPayment({ id: bill._id!, data: paymentData }).unwrap();
      setIsPaymentModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BillStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case BillStatus.PARTIAL: return 'bg-amber-100 text-amber-700 border-amber-200';
      case BillStatus.GENERATED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case BillStatus.DRAFT: return 'bg-slate-100 text-slate-700 border-slate-200';
      case BillStatus.VOID: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Top Action Bar (Hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to list
        </button>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm"
          >
            <Printer size={16} className="mr-2" /> Print
          </button>

          {bill.balance > 0 && bill.status !== BillStatus.DRAFT && bill.status !== BillStatus.VOID && (
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
            >
              <IndianRupee size={16} className="mr-2" /> Collect Payment
            </button>
          )}

          {bill.status !== BillStatus.PAID && bill.status !== BillStatus.VOID && bill.status !== BillStatus.REFUNDED && (
            <button 
              onClick={handleVoid}
              disabled={isVoiding}
              className="flex items-center px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Ban size={16} className="mr-2" /> Void Bill
            </button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:p-0">
        
        {/* Header - Hospital Info */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white print:bg-slate-900 print:text-white">
              <Building size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">MedicaLink General Hospital</h1>
              <p className="text-slate-500 text-sm mt-1">123 Health Avenue, Medical District</p>
              <p className="text-slate-500 text-sm">GSTIN: 27AADCB2230M1Z2</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-200 uppercase tracking-widest">INVOICE</h2>
            <div className="mt-2 text-slate-900 font-bold text-lg">{bill.billNumber}</div>
            <div className="text-sm text-slate-500">
              Date: {new Date(bill.billDate).toLocaleDateString('en-IN')}
            </div>
            <div className={`mt-3 inline-block px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(bill.status)}`}>
              {bill.status}
            </div>
          </div>
        </div>

        {/* Patient & Bill Info */}
        <div className="grid grid-cols-2 gap-8 py-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Billed To</h3>
            <p className="font-bold text-slate-900 text-lg">
              {bill.patient?.firstName} {bill.patient?.lastName}
            </p>
            <p className="text-slate-600 text-sm mt-1">UHID: {bill.patient?.uhid}</p>
            <p className="text-slate-600 text-sm">{bill.patient?.address}</p>
            <p className="text-slate-600 text-sm">{bill.patient?.phone}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Bill Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-500">Bill Type:</span>
              <span className="font-medium text-slate-900 text-right">{bill.billType}</span>
              <span className="text-slate-500">Created By:</span>
              <span className="font-medium text-slate-900 text-right">
                {bill.createdBy?.firstName} {bill.createdBy?.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* Insurance Claim Info (if any) */}
        {bill.insuranceClaim && bill.insuranceClaim.insuranceId && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-4 items-start">
            <Shield className="text-blue-600 shrink-0" />
            <div className="w-full grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600/70 text-xs font-bold uppercase mb-1">TPA / Insurance</p>
                <p className="font-medium text-slate-900">{bill.insuranceClaim.tpaName || 'Registered TPA'}</p>
              </div>
              <div>
                <p className="text-blue-600/70 text-xs font-bold uppercase mb-1">Policy No.</p>
                <p className="font-medium text-slate-900">{bill.insuranceClaim.policyNumber}</p>
              </div>
              <div>
                <p className="text-blue-600/70 text-xs font-bold uppercase mb-1">Pre-Auth / Claim</p>
                <p className="font-medium text-slate-900">{bill.insuranceClaim.claimNumber || bill.insuranceClaim.preAuthNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-600/70 text-xs font-bold uppercase mb-1">Claim Status</p>
                <span className="inline-block px-2 py-0.5 bg-blue-200 text-blue-800 rounded font-bold text-xs">
                  {bill.insuranceClaim.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Void Reason */}
        {bill.status === BillStatus.VOID && bill.voidReason && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start">
            <Ban className="mr-3 shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm">This bill was VOIDED</p>
              <p className="text-sm mt-1">Reason: {bill.voidReason}</p>
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="mt-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Category</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Disc %</th>
                <th className="px-4 py-3 text-right">Tax %</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bill.items.map((item: any, idx: number) => (
                <tr key={item._id || idx}>
                  <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] uppercase tracking-wider border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.discountPct}%</td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.taxRate}%</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Signatures */}
        <div className="mt-8 flex justify-between items-end border-t border-slate-200 pt-6">
          <div className="w-1/2 pr-8 text-sm text-slate-500">
            <p className="font-bold text-slate-900 mb-2">Terms & Conditions:</p>
            <p>1. All amounts are in Indian Rupees (INR).</p>
            <p>2. Goods/Services once billed cannot be cancelled unless authorized.</p>
            <p>3. This is a computer-generated document and does not require a physical signature.</p>
          </div>
          
          <div className="w-[320px] bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-600">Gross Total</span>
              <span className="font-medium">₹{bill.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium text-emerald-600">- ₹{bill.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-600">Taxable Amount</span>
              <span className="font-medium">₹{bill.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs py-1 text-slate-500 ml-4 border-l-2 border-slate-200 pl-2">
              <span>CGST</span>
              <span>₹{bill.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs py-1 text-slate-500 ml-4 border-l-2 border-slate-200 pl-2 mb-1">
              <span>SGST</span>
              <span>₹{bill.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-600">Round Off</span>
              <span className="font-medium">₹{bill.roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="border-t-2 border-slate-300 my-2"></div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-lg font-black text-slate-900 uppercase">Net Payable</span>
              <span className="text-xl font-black text-indigo-600">₹{bill.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {(bill.insuranceClaim?.approvedAmount ?? 0) > 0 && bill.insuranceClaim && (
              <div className="flex justify-between text-sm py-1 text-amber-700 bg-amber-50 -mx-4 px-4 border-y border-amber-100">
                <span className="font-bold">Insurance Covered</span>
                <span className="font-bold">- ₹{bill.insuranceClaim.approvedAmount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm py-1 text-emerald-700 mt-2">
              <span className="font-bold">Total Paid</span>
              <span className="font-bold">₹{bill.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {bill.balance > 0 && bill.status !== BillStatus.VOID && (
              <div className="flex justify-between text-sm py-2 text-rose-600 bg-rose-50 -mx-4 px-4 mt-2 border-t border-rose-100">
                <span className="font-bold uppercase tracking-wider">Balance Due</span>
                <span className="font-black">₹{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment History (if paid) */}
        {bill.payments.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-6 print:mt-6 print:pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <CheckCircle2 size={16} className="text-emerald-500 mr-2" /> Payment History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Mode</th>
                    <th className="px-4 py-2">Reference</th>
                    <th className="px-4 py-2">Received By</th>
                    <th className="px-4 py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bill.payments.map((p: any, idx: number) => (
                    <tr key={p._id || idx}>
                      <td className="px-4 py-2 text-slate-600 flex items-center">
                        <Clock size={14} className="mr-1.5 text-slate-400" />
                        {new Date(p.date).toLocaleString('en-IN', { 
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                        })}
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900">{p.mode}</td>
                      <td className="px-4 py-2 text-slate-500 font-mono text-xs uppercase">{p.reference || '-'}</td>
                      <td className="px-4 py-2 text-slate-600">
                        {p.receivedBy?.firstName} {p.receivedBy?.lastName}
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-emerald-600">
                        {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePayment}
        balanceAmount={bill.balance}
      />
    </div>
  );
};
