import React, { useState, useEffect } from 'react';
import { googleSignIn, initAuth, logout } from '../lib/firebaseAuth';
import { User } from 'firebase/auth';
import { Folder, FileText, Search, ArrowRight, Loader2, Sparkles, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import { Resume } from '../types';

interface GoogleDriveLoaderProps {
  onParsed: (resume: Resume) => void;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

export const GoogleDriveLoader: React.FC<GoogleDriveLoaderProps> = ({ onParsed }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // File processing states
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  // Initial authentication check
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        fetchDriveFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        fetchDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Auth Failed', err);
      setError(err.message || 'Failed to authenticate with Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setFiles([]);
    } catch (err: any) {
      console.error('Failed to logout', err);
    }
  };

  const fetchDriveFiles = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      // Look for PDFs, text files, and Google Docs
      const q = "mimeType = 'application/pdf' or mimeType = 'text/plain' or mimeType = 'application/vnd.google-apps.document' or name contains '.pdf' or name contains '.txt'";
      const fields = "files(id, name, mimeType, size, modifiedTime)";
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=50&q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve files from Google Drive.');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('Fetch Google Drive Files failed:', err);
      setError('Could not fetch files. Try reconnecting your Drive.');
    } finally {
      setLoading(false);
    }
  };

  const processDriveFile = async (file: DriveFile) => {
    if (!token) return;
    setError(null);
    setProcessingFileId(file.id);
    setProcessingStep('Downloading file from Google Drive...');

    try {
      let payload: { fileType?: string; fileData?: string; rawText?: string } = {};

      if (file.mimeType === 'application/vnd.google-apps.document') {
        // High capabilities: Export Google Doc to raw txt
        setProcessingStep('Exporting Google Doc to plain text...');
        const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
        const resp = await fetch(exportUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to export Google Document.');
        const rawText = await resp.text();
        payload = { rawText };
      } else if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Fetch PDF binary blob & convert to base64
        setProcessingStep('Downloading PDF document stream...');
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        const resp = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to download PDF from Drive.');
        const blob = await resp.blob();
        
        // Convert to Base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        payload = { fileType: 'pdf', fileData: base64Data };
      } else {
        // Plain text files
        setProcessingStep('Downloading plain text resume contents...');
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        const resp = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to download text document from Drive.');
        const rawText = await resp.text();
        payload = { rawText };
      }

      setProcessingStep('Passing template data to Gemini AI parser...');
      // Wait details mimic ResumeUploader custom step experience
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingStep('Gemini AI extracting structured resume parameters...');

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gemini resume parser encountered an issue.');
      }

      const result = await response.json();
      setProcessingStep('Recreating styling portfolios...');
      await new Promise(resolve => setTimeout(resolve, 600));

      if (result.parsed) {
        onParsed(result.parsed);
      } else {
        throw new Error('Unable to parse standard resume pattern.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while decoding your Google Drive file.');
    } finally {
      setProcessingFileId(null);
      setProcessingStep('');
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-600" />
            <span>Google Drive Resume Core</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pick resumes, CVs, or Google Docs directly from your cloud files.
          </p>
        </div>

        {user ? (
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || 'photo'} className="w-6 h-6 rounded-full border" />
              )}
              <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{user.displayName || user.email}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-[10px] text-slate-500 hover:text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors pl-2 border-l ml-2 cursor-pointer"
            >
              <LogOut className="w-3 h-3" /> Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="gsi-material-button text-xs font-semibold select-none flex items-center justify-center gap-2 border border-slate-200 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            style={{ width: 'auto' }}
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0 block">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>Connect Google Drive</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl flex items-start gap-2">
          <span className="font-bold shrink-0">⚠️ Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main drive content view */}
      {!user ? (
        <div className="py-8 bg-slate-50/50 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
          <Folder className="w-10 h-10 text-slate-300" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-700">Drive Cloud Storage Offline</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Authorize our Google integration with permission to securely access your file index, making portfolio importing effortless.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm"
          >
            Authenticate Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search bar and refresh icon */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes in Google Drive..."
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => fetchDriveFiles(token!)}
              disabled={loading}
              className="p-2.5 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh Drive index"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* List items with scroll */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-500 font-mono">Scanning Drive folders...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              No PDF documents, plain text files, or Google Docs found in your Google Drive.
            </div>
          ) : (
            <div className="border rounded-2xl divide-y max-h-64 overflow-y-auto">
              {filteredFiles.map((file) => {
                const isProcessing = processingFileId === file.id;
                const fileTypeLabel = 
                  file.mimeType === 'application/pdf' ? 'PDF' :
                  file.mimeType === 'application/vnd.google-apps.document' ? 'Google Doc' : 'Text';
                
                return (
                  <div
                    key={file.id}
                    className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors hover:bg-slate-50/50 ${
                      isProcessing ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className={`w-5 h-5 shrink-0 ${
                        file.mimeType === 'application/pdf' ? 'text-rose-500' :
                        file.mimeType === 'application/vnd.google-apps.document' ? 'text-blue-500' : 'text-slate-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-700 truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">
                          {fileTypeLabel} • {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => processDriveFile(file)}
                      disabled={!!processingFileId}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shrink-0 cursor-pointer ${
                        isProcessing 
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <span>Use File</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Processing display */}
          {processingFileId && (
            <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-300" />
                  <span>Google Cloud Integration Active</span>
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded uppercase">processing</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 font-mono">
                {processingStep}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
