'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { IngestionQueueItem } from '@/types';
import { toast } from 'sonner';

interface IngestionPanelProps {
  queueItems: IngestionQueueItem[];
  onRefresh: () => void;
}

export function IngestionPanel({ queueItems, onRefresh }: IngestionPanelProps) {
  const [pasteText, setPasteText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/ingest', { method: 'POST', body: formData });
        if (res.ok) {
          toast.success(`Queued: ${file.name}`);
          onRefresh();
        } else {
          toast.error('Upload failed');
        }
      } catch {
        toast.error('Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onRefresh]
  );

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    try {
      const res = await fetch('/api/ingest/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pasteText }),
      });
      if (res.ok) {
        toast.success('Text queued for processing');
        setPasteText('');
        onRefresh();
      }
    } catch {
      toast.error('Failed to queue text');
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ingest/process', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Processing complete');
      } else {
        toast.error(data.error || 'Processing failed');
      }
      onRefresh();
    } catch {
      toast.error('Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const statusColors = {
    queued: 'bg-[#d4a574]/15 text-[#d4a574]',
    processing: 'bg-blue-400/15 text-blue-400',
    completed: 'bg-emerald-400/15 text-emerald-400',
    failed: 'bg-red-400/15 text-red-400',
  };

  const statusIcons = {
    queued: FileText,
    processing: Loader2,
    completed: CheckCircle2,
    failed: XCircle,
  };

  const queuedCount = queueItems.filter((i) => i.status === 'queued').length;

  return (
    <Card className="border-[#1e1e2e] bg-[#12121a] p-5">
      <h2
        className="text-lg font-semibold text-[#e2e0ef] mb-4"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Ingest Session
      </h2>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`relative mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragOver
            ? 'border-[#8b7ec8] bg-[#8b7ec8]/5'
            : 'border-[#1e1e2e] hover:border-[#2e2e3e]'
        }`}
      >
        <Upload
          className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-[#8b7ec8]' : 'text-[#e2e0ef]/25'}`}
        />
        <p className="text-sm text-[#e2e0ef]/50">
          Drop a file here
        </p>
        <p className="text-[10px] text-[#e2e0ef]/30 mt-1">
          TXT, MD, PDF, DOCX, HTML, JSON
        </p>
        <label className="mt-2 inline-block">
          <input
            type="file"
            accept=".txt,.md,.pdf,.docx,.html,.htm,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <span className="text-xs text-[#8b7ec8] hover:underline cursor-pointer">
            or click to browse
          </span>
        </label>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#12121a]/80 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-[#8b7ec8]" />
          </div>
        )}
      </div>

      {/* Paste area */}
      <Textarea
        placeholder="Or paste session transcript text..."
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        className="mb-3 min-h-[80px] bg-[#0a0a0f] border-[#1e1e2e] text-sm placeholder:text-[#e2e0ef]/25 focus-visible:ring-[#8b7ec8]/30"
      />
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handlePaste}
          disabled={!pasteText.trim()}
          size="sm"
          className="bg-[#8b7ec8] hover:bg-[#8b7ec8]/90 text-white"
        >
          Queue Text
        </Button>
        <Button
          onClick={handleProcess}
          disabled={isProcessing || queuedCount === 0}
          size="sm"
          variant="outline"
          className="border-[#1e1e2e] hover:bg-[#1e1e2e]"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 mr-1.5" />
          )}
          Process Next
          {queuedCount > 0 && (
            <Badge className="ml-1.5 bg-[#d4a574]/15 text-[#d4a574] border-none text-[10px]">
              {queuedCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Queue list */}
      {queueItems.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider mb-2">
            Queue
          </p>
          {queueItems.slice(0, 8).map((item) => {
            const StatusIcon = statusIcons[item.status];
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 text-xs py-1.5 px-2 rounded bg-[#0a0a0f]/30"
              >
                <StatusIcon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${item.status === 'processing' ? 'animate-spin' : ''}`}
                />
                <span className="flex-1 truncate text-[#e2e0ef]/60">
                  {item.filename || 'Pasted text'}
                </span>
                <Badge className={`text-[10px] border-none ${statusColors[item.status]}`}>
                  {item.status}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
