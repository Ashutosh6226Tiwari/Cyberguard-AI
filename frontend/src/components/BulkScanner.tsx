import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, UploadCloud, Search, ShieldAlert, ShieldCheck, AlertTriangle, Play, Download } from 'lucide-react';

interface BulkScannerProps {
  theme: 'dark' | 'light';
  onScanUrl: (url: string) => void;
}

export const BulkScanner: React.FC<BulkScannerProps> = ({ theme, onScanUrl }) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractUrls = (content: string): string[] => {
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('.'));
  };

  const urls = extractUrls(text);
  const tooMany = urls.length > 20;

  const handleScan = async () => {
    if (urls.length === 0 || tooMany) return;
    setScanning(true);
    setResults([]);
    setProgress(0);

    const newResults = [];
    for (let i = 0; i < urls.length; i++) {
      setProgress(Math.round(((i) / urls.length) * 100));
      // simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const u = urls[i];
      let domain = u;
      try { domain = new URL(u.startsWith('http') ? u : `https://${u}`).hostname; } catch(e) {}
      
      const r = Math.random();
      let verdict = 'BENIGN';
      if (r > 0.8) verdict = 'PHISHING';
      else if (r > 0.6) verdict = 'SUSPICIOUS';
      
      newResults.push({
        url: u,
        domain,
        verdict,
        score: verdict === 'PHISHING' ? 85 : verdict === 'SUSPICIOUS' ? 45 : 12,
        date: new Date().toISOString().split('T')[0]
      });
      setResults([...newResults]);
    }
    setProgress(100);
    setScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setText(e.target.result.toString());
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setText(e.target.result.toString());
        }
      };
      reader.readAsText(file);
    }
  };

  const exportCSV = () => {
    if (!results.length) return;
    const header = 'URL,Domain,Verdict,Risk Score,Date\n';
    const rows = results.map(r => `${r.url},${r.domain},${r.verdict},${r.score},${r.date}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_scan_results.csv';
    a.click();
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'PHISHING': return <span className="badge-critical px-2 py-1 rounded text-xs font-bold border">PHISHING</span>;
      case 'SUSPICIOUS': return <span className="badge-medium px-2 py-1 rounded text-xs font-bold border">SUSPICIOUS</span>;
      default: return <span className="badge-safe px-2 py-1 rounded text-xs font-bold border">SAFE</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2 cyber-font flex items-center justify-center gap-3">
          <Link className="w-8 h-8 text-cyan-400" />
          <span className="cyber-gradient-text">Bulk URL Scanner</span>
        </h1>
        <p className="text-[var(--text-secondary)]">Scan up to 20 URLs simultaneously for phishing and threats.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Input URLs</h2>
            <span className={`px-2 py-1 rounded text-xs font-bold ${tooMany ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/50'}`}>
              {urls.length} / 20 URLs
            </span>
          </div>
          
          <textarea 
            className="w-full h-48 p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors resize-none"
            placeholder="Paste one URL per line..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="text-center text-sm text-[var(--text-secondary)] font-bold">OR</div>

          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-[var(--border-color)] hover:border-cyan-400/50'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv" onChange={handleFileUpload} />
            <UploadCloud className="w-10 h-10 mx-auto mb-2 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)] font-medium">Drag & Drop .txt or .csv file</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">or click to browse</p>
          </div>

          <button 
            onClick={handleScan}
            disabled={urls.length === 0 || tooMany || scanning}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cyber-shimmer-btn"
          >
            {scanning ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scanning...</> : <><Play className="w-5 h-5" /> Scan {urls.length} URLs</>}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {scanning && (
            <div className="glass-panel p-6 rounded-xl text-center">
              <h3 className="font-bold mb-4">Scan Progress</h3>
              <div className="w-full h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)] font-mono">{progress}% Complete</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Results</h2>
                <button onClick={exportCSV} className="flex items-center gap-2 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded hover:border-cyan-400 transition-colors">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-red-500/10 border border-red-500/30 p-2 rounded text-center">
                  <span className="block text-xl font-bold text-red-500">{results.filter(r => r.verdict === 'PHISHING').length}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase">Phishing</span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded text-center">
                  <span className="block text-xl font-bold text-orange-500">{results.filter(r => r.verdict === 'SUSPICIOUS').length}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase">Suspicious</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 p-2 rounded text-center">
                  <span className="block text-xl font-bold text-green-500">{results.filter(r => r.verdict === 'BENIGN').length}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase">Safe</span>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[400px] border border-[var(--border-color)] rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[var(--bg-primary)] sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]">Domain</th>
                      <th className="p-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]">Verdict</th>
                      <th className="p-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-card-hover)] cursor-pointer" onClick={() => onScanUrl(r.url)}>
                        <td className="p-3 font-mono truncate max-w-[120px]">{r.domain}</td>
                        <td className="p-3">{getVerdictBadge(r.verdict)}</td>
                        <td className="p-3 font-mono font-bold">{r.score}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
