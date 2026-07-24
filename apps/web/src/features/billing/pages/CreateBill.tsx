import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  User as UserIcon,
  Activity,
  CreditCard
} from 'lucide-react';
import { 
  useCreateBillMutation, 
  useGetPendingChargesQuery,
  useFinalizeBillMutation
} from '../api/billingApi';
import { useGetPatientByIdQuery } from '../../patients/api/patientApi';
import { BillItemsTable } from '../components/BillItemsTable';
import type { BillItemForm } from '../components/BillItemsTable';
import { BillSummaryPanel } from '../components/BillSummaryPanel';
import { PaymentModal } from '../components/PaymentModal';
import { BillType } from '@medicalink/shared';

export const CreateBill: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const consultationId = searchParams.get('consultationId') || '';

  const { data: patientData, isLoading: isPatientLoading } = useGetPatientByIdQuery(patientId, { skip: !patientId });
  const patient = patientData?.data?.patient;

  const [createBill, { isLoading: isCreating }] = useCreateBillMutation();
  const [finalizeBill] = useFinalizeBillMutation();
  
  const { data: pendingData, refetch: refetchPending, isFetching: isFetchingPending } = useGetPendingChargesQuery(
    { patientId, consultationId },
    { skip: !patientId }
  );

  const [billType, setBillType] = useState<BillType>(BillType.OPD);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<string | null>(null);

  const [userItems, setUserItems] = useState<BillItemForm[] | null>(null);
  const pendingFormatted = useMemo(() => {
    if (!pendingData?.data) return [];
    return pendingData.data.map((item: any, idx: number) => ({
      ...item,
      id: `pending-${idx}-${item.code || item.name}`
    }));
  }, [pendingData]);

  const items = userItems ?? pendingFormatted;
  const setItems = (updater: any) => {
    setUserItems((prev: any) => typeof updater === 'function' ? updater(prev || pendingFormatted) : updater);
  };

  const handleAutoFetch = () => {
    refetchPending().then((res: any) => {
      if (res.data?.data) {
        const formattedItems = res.data.data.map((item: any) => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9)
        }));
        setItems(formattedItems);
      }
    });
  };

  // Calculations
  const calculateTotals = () => {
    let grossAmount = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const gross = item.quantity * item.unitPrice;
      const discount = gross * (item.discountPct / 100);
      const amount = gross - discount;
      const tax = amount * (item.taxRate / 100);

      grossAmount += gross;
      discountAmount += discount;
      taxAmount += tax;
    });

    const netAmount = Math.round((grossAmount - discountAmount) + taxAmount);
    return { grossAmount, discountAmount, taxAmount, netAmount };
  };

  const totals = calculateTotals();

  const handleSaveDraft = async () => {
    if (!patientId) return alert('Patient is required');
    if (items.length === 0) return alert('Add at least one item to the bill');

    try {
      const res = await createBill({
        patient: patientId,
        encounter: consultationId || undefined,
        billType,
        items: items as any
      }).unwrap();
      
      setCreatedBillId(res.data?._id || null);
      alert('Bill saved as DRAFT successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save bill');
    }
  };

  const handleFinalizeAndPay = async () => {
    if (!patientId) return alert('Patient is required');
    if (items.length === 0) return alert('Add at least one item to the bill');

    try {
      // 1. Create bill
      const res = await createBill({
        patient: patientId,
        encounter: consultationId || undefined,
        billType,
        items: items as any
      }).unwrap();
      
      const billId = res.data?._id;
      if (billId) setCreatedBillId(billId);

      // 2. Finalize bill
      if (billId) await finalizeBill(billId).unwrap();
      
      // 3. Open payment modal
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to process bill');
    }
  };

  const handlePaymentConfirm = () => {
    setIsPaymentModalOpen(false);
    // In a full implementation, we would call recordPayment here.
    // For this blueprint flow, we'll navigate to the detail page.
    navigate(`/billing/bills/${createdBillId}`);
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Activity size={48} className="mb-4 text-slate-300" />
        <p>No patient selected. Please select a patient to create a bill.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Bill</h1>
            <p className="text-slate-500">Generate invoice and collect payment</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <select 
            value={billType}
            onChange={(e) => setBillType(e.target.value as BillType)}
            className="rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
          >
            {Object.values(BillType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
              <UserIcon size={32} />
            </div>
            <div className="flex-1">
              {isPatientLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient?.firstName} {patient?.lastName}
                  </h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-500">UHID:</span> {patient?.uhid}</p>
                    <p><span className="font-medium text-slate-500">Age/Gender:</span> {(patient as any)?.age || '-'}y / {patient?.gender}</p>
                    <p><span className="font-medium text-slate-500">Phone:</span> {patient?.phone}</p>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={handleAutoFetch}
              disabled={isFetchingPending}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm border border-indigo-200"
            >
              <RefreshCw size={16} className={`mr-2 ${isFetchingPending ? 'animate-spin' : ''}`} />
              Auto-fetch Charges
            </button>
          </div>

          {/* Items Table */}
          <BillItemsTable items={items} onChange={setItems} />
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <BillSummaryPanel 
            grossAmount={totals.grossAmount}
            discountAmount={totals.discountAmount}
            taxAmount={totals.taxAmount}
            netAmount={totals.netAmount}
          />

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <button
              onClick={handleSaveDraft}
              disabled={isCreating}
              className="w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-bold transition-colors"
            >
              <Save size={18} className="mr-2" /> Save as Draft
            </button>
            <button
              onClick={handleFinalizeAndPay}
              disabled={isCreating}
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md transition-colors"
            >
              <CreditCard size={18} className="mr-2" /> Finalize & Collect Payment
            </button>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          navigate(`/billing/bills/${createdBillId}`);
        }}
        onConfirm={handlePaymentConfirm}
        balanceAmount={totals.netAmount}
      />
    </div>
  );
};
