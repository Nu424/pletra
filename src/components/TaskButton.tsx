import React from 'react';
import { useLongPress } from '../hooks/useLongPress';
import type { Task } from '../types';

interface TaskButtonProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
  onLongPress: (taskId: string) => void;
}

export function TaskButton({ task, index, onClick, onLongPress }: TaskButtonProps) {
  const handlers = useLongPress({
    onClick: () => onClick(task.id),
    onLongPress: () => onLongPress(task.id),
    threshold: 600,
  });

  return (
    <button
      {...handlers}
      className="aspect-square flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all touch-target active:bg-gray-100 dark:active:bg-gray-700"
      style={{ animationDelay: `${0.05 * (index + 1)}s` }}
      aria-label={`タスク: ${task.name}`}
    >
      <span className="emoji mb-2">{task.icon}</span>
      <span className="text-sm text-center">{task.name}</span>
    </button>
  );
} 