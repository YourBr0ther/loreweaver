'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Database, Cpu, Key, RefreshCw, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsData {
  ai: {
    engine: 'claude-code' | 'anthropic-api';
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

  // Claude auth state
  const [claudeAuth, setClaudeAuth] = useState<{
    installed: boolean;
    version: string | null;
    authenticated: boolean;
    subscriptionType?: string | null;
    error?: string;
  } | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [authSaving, setAuthSaving] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);

  // Form state
  const [engine, setEngine] = useState<'claude-code' | 'anthropic-api'>('claude-code');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-5-20250929');

  const checkClaudeAuth = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch('/api/settings/claude-auth');
      if (res.ok) {
        setClaudeAuth(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setAuthChecking(false);
    }
  };

  const handleSetupToken = async () => {
    if (!authToken.trim()) {
      toast.error('Paste your credentials token first');
      return;
    }
    setAuthSaving(true);
    try {
      const res = await fetch('/api/settings/claude-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Claude CLI authenticated');
        setAuthToken('');
        checkClaudeAuth();
      } else {
        toast.error(data.error || 'Authentication failed');
      }
    } catch {
      toast.error('Failed to set up token');
    } finally {
      setAuthSaving(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/stats'),
          checkClaudeAuth(),
        ]);
        if (settingsRes.ok) {
          const data: SettingsData = await settingsRes.json();
          setSettings(data);
          setEngine(data.ai.engine);
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
          engine,
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

          {/* Engine toggle */}
          <div className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-2 block">
                Extraction Engine
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEngine('claude-code')}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    backgroundColor: engine === 'claude-code' ? '#8b7ec815' : 'transparent',
                    borderColor: engine === 'claude-code' ? '#8b7ec830' : '#1e1e2e',
                    color: engine === 'claude-code' ? '#8b7ec8' : '#e2e0ef50',
                  }}
                >
                  Claude Code CLI
                  {engine === 'claude-code' && (
                    <Badge className="ml-2 bg-[#6ab4a015] text-[#6ab4a0] border-none text-[9px]">
                      Active
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setEngine('anthropic-api')}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    backgroundColor: engine === 'anthropic-api' ? '#8b7ec815' : 'transparent',
                    borderColor: engine === 'anthropic-api' ? '#8b7ec830' : '#1e1e2e',
                    color: engine === 'anthropic-api' ? '#8b7ec8' : '#e2e0ef50',
                  }}
                >
                  Anthropic API
                  {engine === 'anthropic-api' && (
                    <Badge className="ml-2 bg-[#6ab4a015] text-[#6ab4a0] border-none text-[9px]">
                      Active
                    </Badge>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#e2e0ef]/20 mt-1.5">
                {engine === 'claude-code'
                  ? 'Uses the Claude Code CLI installed on your system. No API key needed.'
                  : 'Uses the Anthropic API directly. Requires an API key.'}
              </p>
            </div>

            {/* API Key (only for API engine) */}
            {engine === 'anthropic-api' && (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-2 flex items-center gap-1.5">
                  <Key className="w-3 h-3" />
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e0ef] placeholder:text-[#e2e0ef]/15 focus:border-[#8b7ec8]/50 focus:outline-none transition-colors font-mono"
                />
              </div>
            )}

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

        {/* Claude CLI Authentication */}
        {engine === 'claude-code' && (
          <Card className="border-[#1e1e2e] bg-[#12121a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#d4a574]/10">
                <Shield className="w-4 h-4 text-[#d4a574]" />
              </span>
              <h2 className="text-sm font-semibold text-[#e2e0ef]">
                Claude CLI Authentication
              </h2>
              {claudeAuth && (
                <span className="ml-auto flex items-center gap-1.5">
                  {claudeAuth.authenticated ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6ab4a0]" />
                      <span className="text-[11px] text-[#6ab4a0]">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-[#c27878]" />
                      <span className="text-[11px] text-[#c27878]">Not authenticated</span>
                    </>
                  )}
                </span>
              )}
            </div>

            {claudeAuth?.installed && (
              <p className="text-[11px] text-[#e2e0ef]/25 mb-3">
                {claudeAuth.version}
              </p>
            )}

            {claudeAuth?.authenticated ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-[#6ab4a0]/5 border border-[#6ab4a0]/10 px-3 py-2.5">
                  <p className="text-xs text-[#6ab4a0]/80">
                    Claude CLI is authenticated and ready for entity extraction.
                  </p>
                </div>
                <Button
                  onClick={checkClaudeAuth}
                  disabled={authChecking}
                  variant="outline"
                  className="border-[#1e1e2e] text-[#e2e0ef]/40 hover:text-[#e2e0ef]/60 hover:bg-[#1e1e2e]/50 text-xs"
                >
                  {authChecking ? (
                    <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                  )}
                  Recheck
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-[#e2e0ef]/30 leading-relaxed">
                  Generate a setup token on any machine with Claude Code installed, then paste it here.
                </p>
                <code className="block text-[11px] text-[#d4a574] bg-[#0a0a0f] rounded-lg px-3 py-2 font-mono">
                  claude setup-token
                </code>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#e2e0ef]/30 font-medium mb-2 flex items-center gap-1.5">
                    <Key className="w-3 h-3" />
                    Setup Token
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Paste token from claude setup-token..."
                    className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-[#e2e0ef] placeholder:text-[#e2e0ef]/15 focus:border-[#8b7ec8]/50 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSetupToken}
                    disabled={authSaving || !authToken.trim()}
                    className="bg-[#d4a574]/15 text-[#d4a574] hover:bg-[#d4a574]/25 border-none text-xs"
                  >
                    {authSaving ? (
                      <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <Shield className="w-3 h-3 mr-1.5" />
                    )}
                    Authenticate
                  </Button>
                  <Button
                    onClick={checkClaudeAuth}
                    disabled={authChecking}
                    variant="outline"
                    className="border-[#1e1e2e] text-[#e2e0ef]/40 hover:text-[#e2e0ef]/60 hover:bg-[#1e1e2e]/50 text-xs"
                  >
                    {authChecking ? (
                      <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                    )}
                    Recheck
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

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
