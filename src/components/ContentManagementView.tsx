import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  Users, 
  Download, 
  ShieldCheck, 
  FileCheck,
  Plus
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { ContentDocumentRecord } from '../types/enterprise';

export const ContentManagementView: React.FC = () => {
  const { contentDocuments, uploadContentDocument, revokeContentDocument, deviceGroups } = useDevices();

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<ContentDocumentRecord['category']>('clinical_protocol');
  const [docType, setDocType] = useState<ContentDocumentRecord['fileType']>('pdf');
  const [docGroup, setDocGroup] = useState<string>('Chicago SNF Group');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    uploadContentDocument({
      title: docTitle,
      category: docCategory,
      fileType: docType,
      assignedGroups: [docGroup],
      fileSizeMb: parseFloat((Math.random() * 4 + 0.5).toFixed(1)),
      version: '1.0.0',
    });
    setShowUploadModal(false);
    setDocTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Secure Content Locker (MCM)
              </span>
              <span className="text-xs text-slate-400 font-mono">Encrypted Clinical Distribution</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Content & Document Distribution Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Distribute HIPAA-compliant clinical protocols, patient onboarding guides, and device certificates directly to managed endpoints with AES-256 encryption at rest.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Encrypted Document
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentDocuments.map(doc => (
          <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">v{doc.version} • {doc.fileSizeMb} MB ({doc.fileType.toUpperCase()})</p>
                  </div>
                </div>

                <button
                  onClick={() => revokeContentDocument(doc.id)}
                  title="Revoke & Wipe Document from Fleet"
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  {doc.category.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> AES-256
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[11px] font-mono space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Target Groups:</span>
                  <span className="text-white truncate max-w-[150px]">{doc.assignedGroups.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Synced Endpoints:</span>
                  <span className="text-emerald-400">{doc.downloadedDevicesCount}/{doc.targetDevicesCount} Devices</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Uploaded by {doc.uploadedBy}</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <FileCheck className="w-3 h-3" /> Certified
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Upload Encrypted Content</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Post-Op Cardiac Telemetry Care Protocol"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="clinical_protocol">Clinical Protocol</option>
                    <option value="patient_guide">Patient Guide</option>
                    <option value="medical_certificate">Medical Certificate</option>
                    <option value="training_video">Training Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Group</label>
                  <select
                    value={docGroup}
                    onChange={(e) => setDocGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    {deviceGroups.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  Encrypt & Distribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
