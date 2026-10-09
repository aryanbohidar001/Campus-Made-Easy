import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  BookOpen,
  PlusCircle,
  Trash2,
  Download,
  Calendar,
  User,
  CheckCircle2,
  Send,
  FileText,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface TeacherMaterialsProps {
  initialOpenModal?: boolean;
}

export const TeacherMaterials: React.FC<TeacherMaterialsProps> = ({
  initialOpenModal = false,
}) => {
  const { currentUser } = useAuth();
  const { studyMaterials, uploadStudyMaterial, deleteStudyMaterial } = useData();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(initialOpenModal);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'PPT' | 'Notes' | 'Assignment' | 'Link'>('PDF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    await uploadStudyMaterial({
      title,
      subject,
      description,
      fileType,
      fileUrl: '#',
      uploadedBy: currentUser?.name || 'Dr. Rajesh Sharma',
      fileSize: '3.6 MB',
    });

    setIsSubmitting(false);
    setIsUploadModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Course Materials</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload lecture notes, presentation slides, code examples and problem sheets for students
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Uploaded Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {mat.fileType}
                </span>
                <span className="text-[11px] text-slate-400">{mat.uploadDate}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-1">{mat.title}</h4>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">{mat.subject}</p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{mat.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">By {mat.uploadedBy}</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert(`Previewing ${mat.title}`)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Preview
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${mat.title}?`)) {
                      deleteStudyMaterial(mat.id);
                    }
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Course Resource"
        subtitle="Publish notes, assignments, or slides to student portals"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="Operating Systems">Operating Systems</option>
              <option value="Database Management Systems">Database Management Systems</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Design & Analysis of Algorithms">Design & Analysis of Algorithms</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">File Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="PDF">PDF Lecture Document</option>
              <option value="PPT">Presentation Slides (PPT)</option>
              <option value="Assignment">Assignment Problem Set</option>
              <option value="Notes">Handwritten Revision Notes</option>
              <option value="Link">Web Reference / Repository</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 4: Memory Management & Paging Algorithms"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brief Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of contents, reference pages, or deadlines..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Uploading...' : 'Publish Material'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
