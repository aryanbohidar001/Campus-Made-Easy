import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  FileText,
  Download,
  Award,
  CreditCard,
  PlusCircle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const StudentDocuments: React.FC = () => {
  const { currentUser, studentProfile } = useAuth();
  const { documents, requestBonafideCertificate } = useData();

  const [isBonafideModalOpen, setIsBonafideModalOpen] = useState(false);
  const [bonafidePurpose, setBonafidePurpose] = useState('Education Loan / Bank Formalities');
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);

  const handleBonafideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestBonafideCertificate(bonafidePurpose);
    setIsBonafideModalOpen(false);
  };

  const handleDownload = (docTitle: string) => {
    alert(`Downloading authenticated document: "${docTitle}"`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Documents & Digital ID</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified academic credentials, digital identity pass, fee vouchers and instant bonafide requests
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsIdCardModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Digital ID Card</span>
          </button>
          <button
            onClick={() => setIsBonafideModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Bonafide</span>
          </button>
        </div>
      </div>

      {/* Digital ID Card Preview Feature Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
            alt={currentUser?.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30"
          />
          <div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 uppercase border border-blue-400/30">
              Active Student Pass
            </span>
            <h3 className="text-xl font-bold mt-1">{currentUser?.name || 'Aman Sahu'}</h3>
            <p className="text-xs text-blue-200">
              Roll No: <span className="font-bold text-white">{studentProfile?.rollNumber || 'CSE2024089'}</span> &bull; {studentProfile?.course || 'B.Tech CSE'}
            </p>
            <p className="text-[11px] text-blue-300 mt-1">
              Hostel: {studentProfile?.roomNumber || 'B-304'}, {studentProfile?.hostelName || 'Aryabhatta Hostel'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
          <div className="bg-white p-2 rounded-xl text-slate-900">
            <QrCode className="w-12 h-12" />
          </div>
          <div className="text-left text-xs">
            <p className="font-bold text-white">Digital Security Token</p>
            <p className="text-[11px] text-blue-200">Valid until June 2028</p>
            <button
              onClick={() => setIsIdCardModalOpen(true)}
              className="mt-1 text-[11px] text-blue-300 font-bold hover:underline"
            >
              Expand Full ID &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Documents Repository Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Official Document Records</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{doc.issuedDate}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-1">{doc.title}</h4>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{doc.status} by Registrar</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDownload(doc.title)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Bonafide Modal */}
      <Modal
        isOpen={isBonafideModalOpen}
        onClose={() => setIsBonafideModalOpen(false)}
        title="Apply for Bonafide Certificate"
        subtitle="Generates an institution-signed bonafide certificate for administrative purposes"
      >
        <form onSubmit={handleBonafideSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purpose of Certificate</label>
            <select
              value={bonafidePurpose}
              onChange={(e) => setBonafidePurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Education Loan / Bank Formalities">Education Loan / Bank Formalities</option>
              <option value="Passport / Visa Application">Passport / Visa Application</option>
              <option value="Bus / Metro Concession Pass">Bus / Metro Concession Pass</option>
              <option value="Internship / Outside Project NOC">Internship / Outside Project NOC</option>
              <option value="Government Scholarship Application">Government Scholarship Application</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-[11px]">
            Your certificate will be digitally generated with official university seal and registrar signature.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBonafideModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Generate Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Expanded ID Card Modal */}
      <Modal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        title="Student Identity Card"
        subtitle="Official Digital Credential"
        maxWidth="md"
      >
        <div className="border-2 border-blue-600 rounded-2xl p-5 bg-gradient-to-b from-blue-50/50 to-white text-center text-xs space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              CME
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 text-sm leading-none">CAMPUS MADE EASY</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">University Institute of Technology</p>
            </div>
          </div>

          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
            alt={currentUser?.name}
            className="w-24 h-24 rounded-2xl object-cover mx-auto ring-4 ring-blue-100 shadow-md"
          />

          <div>
            <h4 className="text-base font-bold text-slate-900">{currentUser?.name}</h4>
            <p className="font-bold text-blue-600">{studentProfile?.rollNumber}</p>
            <p className="text-slate-600 mt-1">{studentProfile?.course} - {studentProfile?.branch}</p>
            <p className="text-slate-500 text-[11px]">Valid 2024 - 2028 &bull; Blood Group: {studentProfile?.bloodGroup || 'O+'}</p>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-center space-x-2 text-slate-400 text-[11px]">
            <QrCode className="w-16 h-16 text-slate-800" />
          </div>

          <button
            onClick={() => alert('Printing / saving digital student identity card')}
            className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
          >
            Download ID Card
          </button>
        </div>
      </Modal>
    </div>
  );
};
