'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Database, Cpu, Key, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsData {
  ai: {
    apiKey?: string;
    model?: string;
  };
}

interface StatsData {
  totalEntities: number;
  totalRelationships: number;
  totalSessions: number;
  pendingReview: number;
  unresolvedContradictions: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-5-20250929');

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/stats'),
        ]);
        if (settingsRes.ok) {
          const data: SettingsData = await settingsRes.json();
          setSettings(data);
          setApiKey(data.ai.apiKey ?? '');
          setModel(data.ai.model ?? 'claude-sonnet-4-5-20250929');
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        ai: {
          model,
          ...(apiKey && !apiKey.startsWith('****') ? { apiKey } : {}),
        },
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated: SettingsData = await res.json();
      setSettings(updated);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8b7ec8]/30 border-t-[#8b7ec8] rounded-full animate-spin" />
          <p className="text-sm text-[#e2e0ef]/30">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <h1
        className="text-2xl font-semibold text-[#e2e0ef] mb-6"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Settings
      </h1>

      <div className="space-y-6">
        {/* AI Engine Configuration */}
        <Card className="border-[#1e1e2e] bg-[#12121a] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8b7ec8]/10">
              <Cpu className="w-4 h-4 text-[#8b7ec8]" />
            </span>
            <h2 className="text-sm font-semibold text-[#e2e0ef]">
              AI Engine
            </h2>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-2 flex items-center gap-1.5">
                <Key className="w-3 h-3" />
                Anthropic API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e0ef] placeholder:text-[#e2e0ef]/15 focus:border-[#8b7ec8]/50 focus:outline-none transition-colors font-mono"
              />
              <p className="text-[11px] text-[#e2e0ef]/20 mt-1.5">
                Get your key from{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8b7ec8]/60 hover:text-[#8b7ec8] underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            {/* Model selection */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-2 block">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e0ef] focus:border-[#8b7ec8]/50 focus:outline-none transition-colors appearance-none"
              >
                <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
              </select>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-5 pt-4 border-t border-[#1e1e2e]">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#8b7ec8]/15 text-[#8b7ec8] hover:bg-[#8b7ec8]/25 border-none"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </Card>

        {/* Database Stats */}
        {stats && (
          <Card className="border-[#1e1e2e] bg-[#12121a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#d4a574]/10">
                <Database className="w-4 h-4 text-[#d4a574]" />
              </span>
              <h2 className="text-sm font-semibold text-[#e2e0ef]">
                Database
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Entities', value: stats.totalEntities, color: '#8b7ec8' },
                { label: 'Relationships', value: stats.totalRelationships, color: '#6ab4a0' },
                { label: 'Sessions', value: stats.totalSessions, color: '#74a8d4' },
                { label: 'Pending Review', value: stats.pendingReview, color: '#d4a574' },
                { label: 'Contradictions', value: stats.unresolvedContradictions, color: '#c27878' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-[#0a0a0f]/50 px-3 py-2.5"
                >
                  <div
                    className="text-lg font-semibold tabular-nums"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-[#e2e0ef]/25 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
