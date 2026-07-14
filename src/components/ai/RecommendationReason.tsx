// src/components/RecommendationReason.tsx
export default function RecommendationReason({ reason }: { reason?: string }) {
  if (!reason) return null;
  return (
    <div className='mt-2 flex items-start gap-2 rounded-md bg-purple-50 p-2 text-xs text-purple-900 border-purple-200 border'>
      <p aria-hidden className='font-bold w-1/2'>
        AI💡
      </p>
      <p>{reason}</p>
    </div>
  );
}
