import React, { useState, useEffect } from 'react';
import { CampusSettings } from '../../types';
import {
  getCampusSettings,
  saveCampusSettings,
  getAllAttendanceSessions,
} from '../../services/attendanceService';
import {
  DEFAULT_CAMPUS_SETTINGS,
  getDevicePosition,
  formatDistance,
} from '../../utils/geolocation';
import {
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  Compass,
  Sliders,
  Building,
  BookOpen,
  Users,
  Layers,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

export const AdminAttendanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<CampusSettings>(DEFAULT_CAMPUS_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [calibratingGps, setCalibratingGps] = useState<boolean>(false);
  const [calibrationNotice, setCalibrationNotice] = useState<string | null>(null);

  // Department & Subject dynamic input
  const [newDept, setNewDept] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubDept, setNewSubDept] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await getCampusSettings();
        setSettings(loaded);
        if (loaded.departments && loaded.departments.length > 0) {
          setNewSubDept(loaded.departments[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await saveCampusSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save campus settings:', err);
      alert('Could not save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calibrate College location to Admin's current GPS reading
  const handleCalibrateToCurrentLocation = async () => {
    setCalibratingGps(true);
    setCalibrationNotice(null);

    try {
      const pos = await getDevicePosition();
      setSettings((prev) => ({
        ...prev,
        collegeLatitude: Number(pos.latitude.toFixed(6)),
        collegeLongitude: Number(pos.longitude.toFixed(6)),
      }));
      setCalibrationNotice(`College coordinates updated to your current position (Lat: ${pos.latitude.toFixed(4)}, Lon: ${pos.longitude.toFixed(4)}). Click "Save Settings" to commit.`);
    } catch (err: any) {
      alert(err.message || 'Could not retrieve current GPS position.');
    } finally {
      setCalibratingGps(false);
    }
  };

  const handleAddDept = () => {
    if (!newDept.trim()) return;
    if (settings.departments.includes(newDept.trim())) return;
    setSettings((prev) => ({
      ...prev,
      departments: [...prev.departments, newDept.trim()],
    }));
    setNewDept('');
  };

  const handleRemoveDept = (dept: string) => {
    setSettings((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== dept),
    }));
  };

  const handleAddSubject = () => {
    if (!newSubCode.trim() || !newSubName.trim()) return;
    const newSub = {
      code: newSubCode.trim().toUpperCase(),
      name: newSubName.trim(),
      department: newSubDept || settings.departments[0] || 'Engineering',
      semester: '5th',
    };
    setSettings((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
    setNewSubCode('');
    setNewSubName('');
  };

  const handleRemoveSubject = (code: string) => {
    setSettings((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.code !== code),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
        <span>Loading Campus Geofence & Attendance Configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Attendance & Geofence Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional GPS center coordinates, geofence radius, QR expiration intervals, and academic curriculums
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center space-x-2 shadow-md shadow-emerald-500/20 transition self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Campus geofence and attendance rules updated and synchronized across all portals!</span>
        </div>
      )}

      {calibrationNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-center space-x-2 shadow-xs">
          <Compass className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{calibrationNotice}</span>
        </div>
      )}

      {/* Grid: 1. Geofence & Timers, 2. Academic Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: GPS Geofence & QR Timers (Col 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: GPS Geofence Coordinates */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">GPS Geofence Calibration</h3>
                  <p className="text-[11px] text-slate-500">Campus center coordinates & allowed boundary</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalibrateToCurrentLocation}
                disabled={calibratingGps}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
                title="Calibrate college location to your current device coordinates"
              >
                <Compass className={`w-3.5 h-3.5 ${calibratingGps ? 'animate-spin' : ''}`} />
                <span>Set to My Location</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Campus / College Name
                </label>
                <input
                  type="text"
                  value={settings.collegeName}
                  onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  placeholder="e.g. Campus Main Academic Block"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    College Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.collegeLatitude}
                    onChange={(e) => setSettings({ ...settings, collegeLatitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    College Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.collegeLongitude}
                    onChange={(e) => setSettings({ ...settings, collegeLongitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Allowed Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Allowed Attendance Radius
                  </label>
                  <span className="font-bold text-emerald-600 text-sm">
                    {settings.allowedRadius} meters (Default: 150m)
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={settings.allowedRadius}
                  onChange={(e) => setSettings({ ...settings, allowedRadius: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>50m (Strict Room)</span>
                  <span>150m (Standard Campus)</span>
                  <span>500m</span>
                  <span>1000m (Large University)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: QR Expiration Parameters */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Default QR Code Expiration Duration</h3>
                <p className="text-[11px] text-slate-500">Preset lifetime for generated dynamic lecture tokens</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              {[2, 5, 10].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSettings({ ...settings, defaultQrDuration: dur })}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    settings.defaultQrDuration === dur
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold text-base">{dur} mins</span>
                  <span className="text-[10px] opacity-80">{dur === 5 ? 'Recommended' : 'Preset'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Academic Curriculums & Subjects (Col 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Departments / Branches */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Departments & Branches</h3>
                <p className="text-[11px] text-slate-500">Academic faculties active for attendance registers</p>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-wrap gap-2">
              {settings.departments.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                >
                  <span>{dept}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDept(dept)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add dept input */}
            <div className="flex space-x-2 pt-2 text-xs">
              <input
                type="text"
                placeholder="New Department (e.g. Civil Engineering)"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddDept}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Card: Subjects */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Subjects Directory</h3>
                <p className="text-[11px] text-slate-500">Subjects selectable by professors during QR generation</p>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {settings.subjects.map((s) => (
                <div
                  key={s.code}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md mr-2">
                      {s.code}
                    </span>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="text-[10px] text-slate-400 block">{s.department}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(s.code)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subject form */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. CS505)"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl uppercase font-mono"
                />
                <input
                  type="text"
                  placeholder="Subject Title (e.g. Cloud Computing)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSubject}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
