import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  GraduationCap,
  Save,
  CheckCircle2,
  Award,
  Edit2,
} from 'lucide-react';

export const TeacherMarks: React.FC = () => {
  const { marks, updateStudentMarks } = useData();

  const [selectedSubject, setSelectedSubject] = useState('CS501');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editInternal, setEditInternal] = useState<number>(28);
  const [editAssignment, setEditAssignment] = useState<number>(19);
  const [editExam, setEditExam] = useState<number>(44);
  const [saveMessage, setSaveMessage] = useState(false);

  const filteredMarks = marks.filter((m) => m.subjectCode === selectedSubject);

  const handleStartEdit = (record: any) => {
    setEditingRecordId(record.id);
    setEditInternal(record.internalMarks);
    setEditAssignment(record.assignmentMarks);
    setEditExam(record.examMarks);
  };

  const handleSaveMarks = (recordId: string) => {
    updateStudentMarks(recordId, {
      internalMarks: editInternal,
      assignmentMarks: editAssignment,
      examMarks: editExam,
    });
    setEditingRecordId(null);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Academic Grading & Marks Entry</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Record internal assessments, assignments, end-semester marks, and automatic grade generation
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Student marks and final grades recalculated and recorded successfully!</span>
        </div>
      )}

      {/* Subject Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-700">Course / Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden bg-white"
          >
            <option value="CS501">CS501 - Operating Systems</option>
            <option value="CS502">CS502 - Database Management Systems</option>
            <option value="CS503">CS503 - Computer Networks</option>
            <option value="CS504">CS504 - Design & Analysis of Algorithms</option>
            <option value="CS505">CS505 - Software Engineering</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">Autonomous Evaluation Matrix</span>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4 text-center">Internal (Max 30)</th>
              <th className="py-3 px-4 text-center">Assignment (Max 20)</th>
              <th className="py-3 px-4 text-center">End-Sem (Max 50)</th>
              <th className="py-3 px-4 text-center">Calculated Grade</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMarks.map((mk) => {
              const isEditing = editingRecordId === mk.id;

              return (
                <tr key={mk.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Aman Sahu (CSE2024089)</td>
                  <td className="py-3 px-4 text-slate-600">{mk.subjectName}</td>

                  {/* Internal */}
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={editInternal}
                        onChange={(e) => setEditInternal(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center border rounded-lg"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{mk.internalMarks} / 30</span>
                    )}
                  </td>

                  {/* Assignment */}
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={editAssignment}
                        onChange={(e) => setEditAssignment(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center border rounded-lg"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{mk.assignmentMarks} / 20</span>
                    )}
                  </td>

                  {/* Exam */}
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={editExam}
                        onChange={(e) => setEditExam(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center border rounded-lg"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{mk.examMarks} / 50</span>
                    )}
                  </td>

                  {/* Grade */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {mk.grade}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveMarks(mk.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 mx-auto"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(mk)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1 mx-auto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
