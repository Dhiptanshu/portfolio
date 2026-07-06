'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CmsBlock } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Edit, Copy, Eye, EyeOff } from 'lucide-react';

interface SortableBlockItemProps {
  block: CmsBlock;
  onEdit: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableBlockItem({ block, onEdit, onToggleVisibility, onDelete }: SortableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`flex items-center p-3 mb-3 bg-background border ${!block.is_visible ? 'opacity-50' : ''}`}>
        <div {...attributes} {...listeners} className="cursor-grab p-2 hover:bg-muted rounded-md mr-3">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <span className="font-semibold px-2 py-1 bg-muted rounded-md text-xs uppercase tracking-wider">
            {block.type.replace('-', ' ')}
          </span>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {block.content.title || block.content.markdown?.substring(0, 30) || 'Unnamed Block'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onToggleVisibility(block.id)}>
            {block.is_visible ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(block.id)}>
            <Edit className="w-4 h-4 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => onDelete(block.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function PageBuilder({ initialBlocks, onSave }: { initialBlocks: CmsBlock[], onSave: (blocks: CmsBlock[]) => Promise<void> }) {
  const [blocks, setBlocks] = useState<CmsBlock[]>(initialBlocks);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update sort_order locally
        return newItems.map((item, index) => ({ ...item, sort_order: index }));
      });
    }
  };

  const saveBlocks = async () => {
    setSaving(true);
    await onSave(blocks);
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="font-semibold text-lg">Visual Page Builder</h2>
          <p className="text-sm text-muted-foreground">Drag and drop to reorder blocks.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Add Block</Button>
          <Button onClick={saveBlocks} disabled={saving}>{saving ? 'Saving...' : 'Save Layout'}</Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[400px] p-4 border border-dashed rounded-lg bg-muted/20">
            {blocks.map(block => (
              <SortableBlockItem 
                key={block.id} 
                block={block} 
                onEdit={() => {}} 
                onDelete={() => {}}
                onToggleVisibility={() => {}}
              />
            ))}
            {blocks.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No blocks added yet. Click "Add Block" to start building.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
