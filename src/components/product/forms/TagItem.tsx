import { memo } from 'react';
import { X } from 'lucide-react';

interface TagItemProps {
  tag: string;
  onRemove: (tag: string) => void;
}

export const TagItem = memo(({ tag, onRemove }: TagItemProps) => (
  <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-lg text-sm">
    <span className="text-sm">{tag}</span>
    <button
      type="button"
      onClick={() => onRemove(tag)}
      className="text-muted-foreground hover:text-foreground"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
));

TagItem.displayName = 'TagItem';
