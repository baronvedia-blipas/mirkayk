import Image from "next/image";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description = "This feature is blooming shortly.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Image src="/svg/leaf-2.svg" alt="" width={80} height={120} className="opacity-40 mb-6" />
      <h2 className="font-display text-xl text-text-700 mb-2">{title}</h2>
      <p className="font-body text-text-500 text-sm">{description}</p>
    </div>
  );
}
