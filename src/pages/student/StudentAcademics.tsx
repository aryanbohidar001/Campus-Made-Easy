import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  GraduationCap,
  Award,
  BookOpen,
  TrendingUp,
  BarChart3,
  CheckCircle,
} from 'lucide-react';

export const StudentAcademics: React.FC = () => {
  const { studentProfile } = useAuth();
  const { marks } = useData();

  const totalCredits = marks.reduce((acc, curr) => acc + curr.credits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Academic Progress & Grades</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Cumulative GPA, semester exam scores, internal assessments, and subject credits
        </p>
      </div>

      {/* CGPA / SGPA Highlight Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md shadow-blue-500/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <Award className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-3xl font-extrabold mt-2">
            {studentProfile?.cgpa || 8.78}{' '}
            <span className="text-sm font-normal text-blue-200">/ 10.0</span>
          </p>
          <p className="text-xs text-blue-100 mt-1">Status: First Class with Distinction</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current SGPA (Sem 5)
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            8.92 <span className="text-sm font-normal text-slate-400">/ 10.0</span>
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            +0.14 increase from Semester 4
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Earned Credits
            </span>
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            104 <span className="text-sm font-normal text-slate-400">/ 160</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{totalCredits} credits registered this semester</p>
        </div>
      </div>

      {/* Detailed Marks Statement Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Semester V - Course Grade Sheet</span>
          </h3>
          <span className="text-xs text-slate-500">Autonomous Curriculum 2024-2028</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Subject Code</th>
                <th className="py-3 px-3">Subject Title</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center">Internal (30)</th>
                <th className="py-3 px-3 text-center">Assignment (20)</th>
                <th className="py-3 px-3 text-center">End-Sem (50)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marks.map((m) => {
                const total = m.internalMarks + m.assignmentMarks + m.examMarks;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-blue-600">{m.subjectCode}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{m.subjectName}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{m.credits}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">{m.internalMarks}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">{m.assignmentMarks}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">{m.examMarks}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{total}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {m.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
