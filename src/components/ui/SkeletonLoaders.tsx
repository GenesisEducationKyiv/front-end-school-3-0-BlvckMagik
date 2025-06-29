"use client";

interface SkeletonBoxProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

function SkeletonBox({ 
  width = "w-full", 
  height = "h-4", 
  className = "", 
  rounded = "sm" 
}: SkeletonBoxProps): React.JSX.Element {
  const roundedClass = {
    none: "",
    sm: "rounded",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  }[rounded];

  return (
    <div 
      className={`bg-gray-300 animate-pulse ${width} ${height} ${roundedClass} ${className}`}
    />
  );
}

interface ModalWrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
}

function ModalWrapper({ children, maxWidth = "max-w-md" }: ModalWrapperProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-zinc-900 rounded-lg p-6 w-full ${maxWidth}`}>
        {children}
      </div>
    </div>
  );
}

export function UniversalModalSkeleton(): React.JSX.Element {
  return (
    <ModalWrapper>
      <SkeletonBox height="h-64" rounded="md" />
    </ModalWrapper>
  );
}

export function TrackItemSkeleton(): React.JSX.Element {
  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 gap-4 md:gap-6 max-w-[60%] md:max-w-[100%]">
        <SkeletonBox width="w-16" height="h-16" rounded="sm" />
        <div className="grid space-y-2">
          <SkeletonBox width="w-32" height="h-5" />
          <SkeletonBox width="w-24" height="h-4" />
          <SkeletonBox width="w-20" height="h-3" />
          <div className="gap-2 mt-1 hidden md:flex">
            <SkeletonBox width="w-16" height="h-6" />
            <SkeletonBox width="w-20" height="h-6" />
          </div>
        </div>
      </div>
      <div className="flex space-x-2 gap-2 md:gap-6">
        <SkeletonBox width="w-12" height="h-12" rounded="full" />
        <SkeletonBox width="w-8" height="h-8" rounded="full" />
      </div>
    </div>
  );
}

export function TrackListSkeleton({ count = 5 }: { count?: number }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: count }, (_, index) => (
        <TrackItemSkeleton key={index} />
      ))}
    </div>
  );
} 