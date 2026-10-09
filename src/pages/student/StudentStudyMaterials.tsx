import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  BookOpen,
  Search,
  Download,
  FileText,
  FileCode,
  File,
  ExternalLink,
  User,
  Calendar,
} from 'lucide-react';

export const StudentStudyMaterials: React.FC = () => {
  const { studyMaterials } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const subjects = ['All', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Design & Analysis of Algorithms', 'Software Engineering'];

  const filtered = studyMaterials.filter((mat) => {
    const matchSubject = selectedSubject === 'All' || mat.subject === selectedSubject;
    const matchQuery =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchQuery;
  });

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'PDF':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">PDF Document</span>;
      case 'PPT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Slides PPT</span>;
      case 'Assignment':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">Assignment</span>;
      case 'Notes':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Handwritten Notes</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Web Resource</span>;
    }
  };

  const handleDownload = (mat: any) => {
    alert(`Downloading lecture material: "${mat.title}" (${mat.fileType})`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Study Materials & Notes</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Access lecture slides, textbook references, assignment problem sets, and lab manuals
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === sub
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Study Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No study materials found for the selected subject.
          </div>
        ) : (
          filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-blue-200 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getFileBadge(mat.fileType)}
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {mat.uploadDate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{mat.title}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{mat.subject}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {mat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-[11px] text-slate-500">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{mat.uploadedBy}</span>
                  {mat.fileSize && <span className="ml-2 text-slate-400">({mat.fileSize})</span>}
                </div>

                <button
                  onClick={() => handleDownload(mat)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
