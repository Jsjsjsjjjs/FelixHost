// src/components/ui/SkeletonCard.tsx

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-ptero-border bg-ptero-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton w-2.5 h-2.5 rounded-full" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="skeleton h-3 w-20 rounded mb-4" />
      <div className="space-y-2 mb-4">
        <div className="skeleton h-2 w-full rounded" />
        <div className="skeleton h-2 w-full rounded" />
        <div className="skeleton h-2 w-full rounded" />
      </div>
      <div className="flex gap-1 pt-3 border-t border-ptero-border/50">
        <div className="skeleton h-8 w-8 rounded-md" />
        <div className="skeleton h-8 w-8 rounded-md" />
        <div className="skeleton h-8 w-8 rounded-md" />
        <div className="skeleton h-8 w-8 rounded-md ml-auto" />
      </div>
    </div>
  );
}
