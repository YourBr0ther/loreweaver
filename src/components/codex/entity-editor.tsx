'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { Entity, Tag } from '@/types';
import { toast } from 'sonner';

interface EntityEditorProps {
  entity: Entity;
  tags: Tag[];
  onSave: () => void;
  onCancel: () => void;
}

export function EntityEditor({ entity, tags, onSave, onCancel }: EntityEditorProps) {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description);
  const [newTag, setNewTag] = useState('');
  const [currentTags, setCurrentTags] = useState(tags);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/entities/${entity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        toast.success('Entity updated');
        onSave();
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    // Tags would need a dedicated API endpoint — for now, just add locally
    setCurrentTags([...currentTags, { id: `temp-${Date.now()}`, entity_id: entity.id, tag: newTag.trim() }]);
    setNewTag('');
  };

  const removeTag = (tagId: string) => {
    setCurrentTags(currentTags.filter((t) => t.id !== tagId));
  };

  return (
    <div className="space-y-4 rounded-lg border border-[#8b7ec8]/20 bg-[#12121a] p-5">
      <div>
        <label className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider">
          Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 bg-[#0a0a0f] border-[#1e1e2e] focus-visible:ring-[#8b7ec8]/30"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 min-h-[120px] bg-[#0a0a0f] border-[#1e1e2e] focus-visible:ring-[#8b7ec8]/30"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[#e2e0ef]/40 uppercase tracking-wider">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {currentTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="border-[#1e1e2e] text-[#e2e0ef]/60 pr-1"
            >
              {tag.tag}
              <button onClick={() => removeTag(tag.id)} className="ml-1 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              className="h-6 w-24 text-xs bg-[#0a0a0f] border-[#1e1e2e]"
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <Button variant="ghost" size="sm" onClick={addTag} className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="bg-[#8b7ec8] hover:bg-[#8b7ec8]/90 text-white"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button onClick={onCancel} variant="ghost" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}
