'use client';

import { useState } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Tag } from '@/lib/data';

interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ tags, selectedTags, onTagsChange }: TagFilterProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Filter by Technology</h3>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className="transition-all duration-200 hover:scale-105"
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag.name} filter`}
            >
              <Badge
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                style={tag.color ? { backgroundColor: tag.color } : undefined}
              >
                {tag.name}
              </Badge>
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedTags.length} filter{selectedTags.length === 1 ? '' : 's'} applied
        </div>
      )}
    </div>
  );
}