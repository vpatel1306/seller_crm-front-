import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiX, FiFolder, FiFile, FiUploadCloud, FiSkipForward,
  FiTrash2, FiAlertTriangle, FiChevronRight, FiChevronDown,
  FiHardDrive, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiLoader, FiPlusCircle,
} from 'react-icons/fi';
import { MdOutlineFolderOpen } from 'react-icons/md';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Type detection ───────────────────────────────────────────────
const TYPE_COLORS = {
  Orders:   'bg-blue-100 text-blue-700',
  Transit:  'bg-yellow-100 text-yellow-700',
  'O.F.D.': 'bg-purple-100 text-purple-700',
  Returns:  'bg-orange-100 text-orange-700',
  Payment:  'bg-green-100 text-green-700',
  Unknown:  'bg-gray-100 text-gray-500',
};

function resolveType(name = '') {
  const n = name.toLowerCase();
  if (n.includes('intransit') || n.includes('in_transit')) return 'Transit';
  if (n.includes('ofd') || n.includes('o.f.d'))           return 'O.F.D.';
  if (n.includes('return') || n.includes('delivered'))    return 'Returns';
  if (n.includes('payment') || n.includes('ads'))         return 'Payment';
  if (n.includes('order'))                                return 'Orders';
  return 'Unknown';
}

// ─── Build a simple folder tree from a path string ───────────────
// e.g. "C:\Users\Mantra\Downloads" → nodes array
function buildTree(pathStr) {
  if (!pathStr) return [];
  // normalise separators
  const parts = pathStr.replace(/\\/g, '/').split('/').filter(Boolean);
  if (!parts.length) return [];

  // Root drive node
  const root = {
    id: 'root',
    label: parts[0] || 'Root',
    icon: 'drive',
    open: true,
    children: [],
  };

  let current = root;
  for (let i = 1; i < parts.length; i++) {
    const child = {
      id: `node-${i}`,
      label: parts[i],
      open: true,
      active: i === parts.length - 1,
      children: [],
    };
    current.children.push(child);
    current = child;
  }
  return [root];
}

// ─── Folder Tree Node (stateless open = driven by node.open) ─────
function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(node.open ?? (depth === 0));
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-[3px] cursor-pointer rounded text-[0.72rem] font-medium select-none transition-colors
          ${node.active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: 4 }}
        onClick={() => setOpen((o) => !o)}
      >
        {hasChildren
          ? open
            ? <FiChevronDown size={11} className="flex-shrink-0" />
            : <FiChevronRight size={11} className="flex-shrink-0" />
          : <span className="w-[11px] inline-block" />}
        {node.icon === 'drive'
          ? <FiHardDrive size={13} className="flex-shrink-0 text-blue-400" />
          : node.active
            ? <MdOutlineFolderOpen size={14} className="flex-shrink-0 text-white" />
            : <FiFolder size={13} className="flex-shrink-0 text-amber-500" />}
        <span className="truncate leading-none">{node.label}</span>
      </div>
      {open && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Status icon helper ──────────────────────────────────────────
function StatusCell({ status }) {
  if (status === 'uploading') return (
    <span className="flex items-center justify-center gap-1 text-blue-600 font-bold text-[0.65rem]">
      <FiLoader size={12} className="animate-spin" /> Uploading…
    </span>
  );
  if (status === 'success') return (
    <span className="flex items-center justify-center gap-1 text-green-600 font-bold text-[0.65rem]">
      <FiCheckCircle size={12} /> Success
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center justify-center gap-1 text-red-600 font-bold text-[0.65rem]">
      <FiXCircle size={12} /> Error
    </span>
  );
  if (status === 'skipped') return (
    <span className="flex items-center justify-center gap-1 text-amber-600 font-bold text-[0.65rem]">
      <FiSkipForward size={12} /> Skipped
    </span>
  );
  return <span className="text-gray-400">—</span>;
}

// ─── Main Modal ──────────────────────────────────────────────────
export default function ImportDataModal({ isOpen, onClose }) {
  const { activeAccount } = useAuth();
  const navigate = useNavigate();
  const accountName = activeAccount?.account_name || 'No account selected';

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteAfter, setDeleteAfter] = useState(true);
  const [folderPath, setFolderPath] = useState('C:\\Users\\Mantra\\Downloads');
  const [folderTree, setFolderTree] = useState(() => buildTree('C:\\Users\\Mantra\\Downloads'));

  // hidden inputs
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);



  // ── Escape key
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === 'Escape') {
        onClose();
        navigate('/');
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, navigate, onClose]);

  // ── Load files when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelectedId(null);
    }
  }, [isOpen]);

  // ── Update tree whenever path changes
  useEffect(() => {
    setFolderTree(buildTree(folderPath));
  }, [folderPath]);

  // ── Close → dashboard
  function handleClose() {
    onClose();
    navigate('/');
  }

  // ── Load files from API (or demo fallback)
  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/import-files-list/');
      const list = res.data?.data || res.data || [];
      setFiles(list.map((f, i) => ({
        id: i + 1,
        name: f.file_name || f.name || `File_${i + 1}.csv`,
        time: f.modified_time || f.time || new Date().toLocaleString('en-IN'),
        type: f.file_type || resolveType(f.file_name || f.name || ''),
        entries: f.entries ?? null,
        status: '',
        size: f.size || '',
        raw: null,
      })));
    } catch {
      setFiles([
        { id: 1, name: 'Orders_2025-06-11_2025-07-10_17_24-17_29_30478.csv | 221 kb', time: '10/07/2025 05:25:59 PM', type: 'Orders',   entries: null, status: '', size: '221 kb', raw: null },
        { id: 2, name: 'intransit__________2025-07-10_17-0-17_59_30478__.csv | 54 kb',  time: '10/07/2025 05:27:26 PM', type: 'Transit',  entries: null, status: '', size: '54 kb',  raw: null },
        { id: 3, name: 'ofd_reverse__________2025-07-10_17-0-17_59_30478__.csv | 1 kb', time: '10/07/2025 05:27:25 PM', type: 'O.F.D.',   entries: null, status: '', size: '1 kb',   raw: null },
        { id: 4, name: 'completed_delivered_____last_2_week____2025-07-10.csv | 87 kb', time: '10/07/2025 05:27:24 PM', type: 'Returns',  entries: null, status: '', size: '87 kb',  raw: null },
        { id: 5, name: '30478_SP_ORDER_ADS_REFERRAL_PAYMENT_FILE_PREVIOUS_PAYMENT_2025-07-02.xlsx | 79 kb', time: '10/07/2025 05:27:08 PM', type: 'Payment', entries: null, status: '', size: '79 kb', raw: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Helper to update a single file's status in state
  const updateStatus = (id, status, extra = {}) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status, ...extra } : f));
  };

  // ── Import one-by-one
  const handleImport = async () => {
    const toImport = files.filter((f) => f.status !== 'skipped' && f.status !== 'success');
    if (!toImport.length) return;

    setImporting(true);

    for (const file of toImport) {
      updateStatus(file.id, 'uploading');
      try {
        if (file.raw) {
          // Local file picked by user — send as FormData
          const fd = new FormData();
          fd.append('file', file.raw);
          fd.append('delete_after', String(deleteAfter));
          await api.post('/import-data/', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          // Server-side file — send file name
          await api.post('/import-data/', {
            file_name: file.name,
            delete_after: deleteAfter,
          });
        }
        updateStatus(file.id, 'success');
      } catch {
        updateStatus(file.id, 'error');
      }
    }

    setImporting(false);
  };

  // ── Skip selected file
  const handleSkip = () => {
    if (selectedId == null) return;
    updateStatus(selectedId, 'skipped');
    setSelectedId(null);
  };

  // ── Delete selected file from list + API
  const handleDelete = async () => {
    if (selectedId == null) return;
    const file = files.find((f) => f.id === selectedId);
    if (!file) return;
    try {
      await api.delete('/import-files-delete/', { data: { file_name: file.name } });
    } catch { /* ignore — remove from list anyway */ }
    setFiles((prev) => prev.filter((f) => f.id !== selectedId));
    setSelectedId(null);
  };

  // ── Open Folder — uses a hidden <input type="file" webkitdirectory>
  const handleOpenFolder = () => {
    folderInputRef.current?.click();
  };

  const onFolderSelected = (e) => {
    const picked = e.target.files;
    if (!picked || picked.length === 0) return;

    // Extract folder path from the first file's webkitRelativePath
    const firstFile = picked[0];
    const relativePath = firstFile.webkitRelativePath || firstFile.name;
    const folderName = relativePath.split('/')[0];

    // Build a browser-friendly path string
    const newPath = `Selected Folder: ${folderName}`;
    setFolderPath(newPath);

    // Add picked files to the list
    const now = new Date().toLocaleString('en-IN');
    const maxId = files.reduce((m, f) => Math.max(m, f.id), 0);
    const newFiles = Array.from(picked)
      .filter((f) => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['csv', 'xlsx', 'xls'].includes(ext);
      })
      .map((f, i) => ({
        id: maxId + i + 1,
        name: `${f.name} | ${Math.round(f.size / 1024)} kb`,
        time: now,
        type: resolveType(f.name),
        entries: null,
        status: '',
        size: `${Math.round(f.size / 1024)} kb`,
        raw: f,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
    // reset so the same folder can be re-picked
    e.target.value = '';
  };

  // ── Open File — lets user pick individual files to add
  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = (e) => {
    const picked = e.target.files;
    if (!picked || picked.length === 0) return;

    const now = new Date().toLocaleString('en-IN');
    const maxId = files.reduce((m, f) => Math.max(m, f.id), 0);

    const newFiles = Array.from(picked).map((f, i) => ({
      id: maxId + i + 1,
      name: `${f.name} | ${Math.round(f.size / 1024)} kb`,
      time: now,
      type: resolveType(f.name),
      entries: null,
      status: '',
      size: `${Math.round(f.size / 1024)} kb`,
      raw: f,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  // ── Computed
  const visibleFiles = files; // all files visible; skipped shown with badge
  const pendingCount = files.filter((f) => f.status !== 'success' && f.status !== 'skipped').length;
  const successCount = files.filter((f) => f.status === 'success').length;

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1200] p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Hidden inputs */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={onFolderSelected}
        accept=".csv,.xlsx,.xls"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFilesSelected}
        accept=".csv,.xlsx,.xls"
      />

      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[1200px] max-h-[92vh] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{ minHeight: 500 }}
      >
        {/* ── Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700 to-violet-700 text-white flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FiUploadCloud size={17} />
            Import Data
            <span className="text-white/60 font-normal">— {accountName}</span>
            {importing && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-[0.65rem] font-semibold animate-pulse">
                Importing {successCount}/{files.filter(f => f.status !== 'skipped').length}…
              </span>
            )}
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            onClick={handleClose}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: File Table */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Directory path bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex-shrink-0 gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  File Directory
                </div>
                <div className="text-[0.75rem] font-medium text-blue-600 truncate">
                  {folderPath}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-[0.65rem] font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                  onClick={() => { setFiles([]); loadFiles(); }}
                  disabled={importing}
                >
                  <FiRefreshCw size={11} /> Refresh
                </button>
                <button
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[0.65rem] font-bold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                  onClick={handleOpenFolder}
                  disabled={importing}
                >
                  <MdOutlineFolderOpen size={13} /> Open Folder
                </button>
              </div>
            </div>

            {/* Green notice bar */}
            <div className="mx-4 mt-3 mb-1 px-3 py-2 bg-green-500 text-white text-[0.7rem] font-semibold rounded flex items-center gap-2 flex-shrink-0">
              <FiAlertTriangle size={13} className="flex-shrink-0" />
              The order file needs to be repeated daily for the last 30 days to maintain high accuracy.
            </div>

            {/* File table */}
            <div className="flex-1 overflow-auto px-4 pb-1">
              <table className="w-full text-left border-collapse text-[0.72rem]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase text-[0.65rem] tracking-wider">
                    <th className="py-2 pr-2 pl-1 w-6 text-center">#</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 px-3 whitespace-nowrap">Time</th>
                    <th className="py-2 px-3 whitespace-nowrap">File Type</th>
                    <th className="py-2 px-3 text-center">Entries</th>
                    <th className="py-2 px-3 text-center min-w-[90px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                          Loading files…
                        </div>
                      </td>
                    </tr>
                  ) : visibleFiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400 text-xs italic">
                        No files found. Use <strong>Open Folder</strong> or <strong>Open File</strong> to add files.
                      </td>
                    </tr>
                  ) : (
                    visibleFiles.map((f, idx) => {
                      const isSelected = selectedId === f.id;
                      const typeColor = TYPE_COLORS[f.type] || TYPE_COLORS.Unknown;
                      const isSkipped = f.status === 'skipped';
                      const isDone = f.status === 'success';
                      return (
                        <tr
                          key={f.id}
                          onClick={() => !importing && setSelectedId(isSelected ? null : f.id)}
                          className={`border-b border-gray-50 transition-colors
                            ${importing ? 'cursor-default' : 'cursor-pointer'}
                            ${isSelected ? 'bg-blue-600 text-white' : isSkipped ? 'bg-amber-50 text-gray-400' : isDone ? 'bg-green-50' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          <td className={`py-2 pr-2 pl-1 text-center font-medium ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                            {idx + 1}
                          </td>
                          <td className={`py-2 pr-3 font-medium ${isSkipped ? 'line-through opacity-60' : ''} ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                            <div className="flex items-center gap-1.5">
                              <FiFile size={12} className={isSelected ? 'text-white/70' : 'text-gray-400 flex-shrink-0'} />
                              <span className="truncate max-w-[320px] block">{f.name}</span>
                              {f.raw && (
                                <span className="ml-1 px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[0.6rem] font-bold rounded flex-shrink-0">LOCAL</span>
                              )}
                            </div>
                          </td>
                          <td className={`py-2 px-3 whitespace-nowrap ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                            {f.time}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${isSelected ? 'bg-white/20 text-white' : typeColor}`}>
                              {f.type}
                            </span>
                          </td>
                          <td className={`py-2 px-3 text-center ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {f.entries ?? '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isSelected && f.status === ''
                              ? <span className="text-white/80">—</span>
                              : <StatusCell status={f.status} />
                            }
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Progress summary bar (visible during/after import) */}
            {files.some(f => f.status !== '') && (
              <div className="mx-4 mb-2 px-3 py-2 rounded bg-indigo-50 border border-indigo-200 flex items-center gap-4 text-[0.7rem] font-semibold flex-shrink-0 flex-wrap">
                <span className="text-green-700 flex items-center gap-1">
                  <FiCheckCircle size={12} /> Success: {files.filter(f => f.status === 'success').length}
                </span>
                <span className="text-red-600 flex items-center gap-1">
                  <FiXCircle size={12} /> Error: {files.filter(f => f.status === 'error').length}
                </span>
                <span className="text-amber-600 flex items-center gap-1">
                  <FiSkipForward size={12} /> Skipped: {files.filter(f => f.status === 'skipped').length}
                </span>
                {importing && (
                  <span className="text-blue-600 flex items-center gap-1 ml-auto animate-pulse">
                    <FiLoader size={12} className="animate-spin" />
                    Please wait, importing one by one…
                  </span>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              {/* Left info */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteAfter}
                    onChange={(e) => setDeleteAfter(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                    disabled={importing}
                  />
                  Delete File After Import
                </label>
                <span className="text-[0.7rem] font-bold text-blue-600">
                  Total Files — {files.length}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Import */}
                <button
                  className={`px-3 py-2 rounded text-[0.7rem] font-bold transition-all active:scale-95 flex items-center gap-1.5
                    ${importing || pendingCount === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/25'}`}
                  onClick={handleImport}
                  disabled={importing || pendingCount === 0}
                >
                  <FiUploadCloud size={13} />
                  {importing ? 'Importing…' : 'IMPORT DATA FROM FILES'}
                </button>

                {/* Skip */}
                <button
                  className={`px-3 py-2 rounded text-[0.7rem] font-bold transition-all active:scale-95 flex items-center gap-1.5
                    ${selectedId && !importing
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  onClick={handleSkip}
                  disabled={!selectedId || importing}
                >
                  <FiSkipForward size={13} />
                  Skipped Selected File
                </button>

                {/* Open File */}
                <button
                  className={`px-3 py-2 rounded text-[0.7rem] font-bold transition-all active:scale-95 flex items-center gap-1.5
                    ${importing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/25'}`}
                  onClick={handleOpenFile}
                  disabled={importing}
                >
                  <FiPlusCircle size={13} />
                  Open File
                </button>

                {/* Delete */}
                <button
                  className={`px-3 py-2 rounded text-[0.7rem] font-bold transition-all active:scale-95 flex items-center gap-1.5
                    ${selectedId && !importing
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  onClick={handleDelete}
                  disabled={!selectedId || importing}
                >
                  <FiTrash2 size={13} />
                  Delete Selected File
                </button>

                {/* Close → dashboard */}
                <button
                  className="px-3 py-2 rounded text-[0.7rem] font-bold bg-gray-700 hover:bg-gray-800 text-white border border-gray-600 transition-all active:scale-95"
                  onClick={handleClose}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Dynamic Folder Tree */}
          <div className="w-[200px] flex-shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="px-3 py-2 text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
              <span>Folders</span>
              <button
                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                onClick={handleOpenFolder}
                title="Choose folder"
              >
                <MdOutlineFolderOpen size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-1 px-1">
              {folderTree.map((node) => (
                <TreeNode key={node.id} node={node} depth={0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
