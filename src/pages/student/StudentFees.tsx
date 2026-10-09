import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Download,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const StudentFees: React.FC = () => {
  const { studentProfile } = useAuth();
  const { fees, payFee } = useData();

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(20000);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<string | null>(null);

  const myFee = fees[0] || {
    totalAmount: 108000,
    paidAmount: 88000,
    pendingAmount: 20000,
    dueDate: '2026-10-15',
    status: 'Partial',
    tuitionFee: 65000,
    hostelFee: 22000,
    messFee: 18000,
    libraryFee: 3000,
    transactions: [],
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const result = await payFee(
      studentProfile?.userId || 'user-student-1',
      payAmount,
      paymentMethod
    );

    setIsProcessing(false);
    setPaidReceipt(result.receiptNo);
    setTimeout(() => {
      setPaidReceipt(null);
      setIsPayModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tuition & Campus Fees</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic fee statements, hostel & mess dues, installment history, and online fee clearing
          </p>
        </div>

        {myFee.pendingAmount > 0 && (
          <button
            onClick={() => {
              setPayAmount(myFee.pendingAmount);
              setIsPayModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition self-start sm:self-auto"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Outstanding Balance (₹{myFee.pendingAmount.toLocaleString()})</span>
          </button>
        )}
      </div>

      {/* Primary KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Fee Assessed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{myFee.totalAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Academic Year 2026-2027</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800 uppercase">Amount Paid</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            ₹{myFee.paidAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Cleared via digital payment</p>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 bg-rose-50/40 p-5 shadow-xs">
          <p className="text-xs font-semibold text-rose-800 uppercase">Outstanding Balance</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">
            ₹{myFee.pendingAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-rose-600 mt-0.5">Due before {myFee.dueDate}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Payment Status</p>
          <div className="mt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                myFee.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {myFee.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Next installment deadline</p>
        </div>
      </div>

      {/* Fee Breakdown Statement */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Receipt className="w-4 h-4 text-blue-600" />
          <span>Semester V Fee Structure Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500">Tuition & Lab Fee</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              ₹{(myFee.tuitionFee || 65000).toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500">Hostel Accommodation</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              ₹{(myFee.hostelFee || 22000).toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500">Mess & Dining Advance</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              ₹{(myFee.messFee || 18000).toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500">Library & Sports Amenities</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              ₹{(myFee.libraryFee || 3000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Receipts & Transactions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(myFee.transactions || []).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-blue-600">{tx.receiptNo}</td>
                  <td className="py-3 px-3 text-slate-600">{tx.date}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{tx.method}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Success
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => alert(`Downloading official fee receipt #${tx.receiptNo}`)}
                      className="text-blue-600 font-semibold hover:underline flex items-center justify-center space-x-1 mx-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Online Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Simulated Campus Fee Payment"
        subtitle="Clear outstanding dues instantly with verified e-receipt generation"
      >
        {paidReceipt ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-900">Payment Successful!</p>
            <p className="text-xs text-slate-600 mt-1">
              Receipt <span className="font-bold text-blue-600">{paidReceipt}</span> generated and added to your documents.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount to Pay</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={100}
                  max={myFee.pendingAmount || 50000}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'Debit/Credit Card', 'Net Banking'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-center font-semibold rounded-xl border transition ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit SSL Encrypted Simulated Campus Gateway</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Processing...' : `Confirm Pay ₹${payAmount.toLocaleString()}`}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
