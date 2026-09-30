export const PostSkeleton = () => (
  <div className="card p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full skeleton" />
      <div className="flex-1"><div className="h-4 skeleton rounded w-32 mb-1" /><div className="h-3 skeleton rounded w-20" /></div>
    </div>
    <div className="space-y-2 mb-4"><div className="h-4 skeleton rounded w-full" /><div className="h-4 skeleton rounded w-4/5" /></div>
    <div className="h-48 skeleton rounded-xl mb-4" />
    <div className="flex gap-4"><div className="h-8 skeleton rounded-xl w-20" /><div className="h-8 skeleton rounded-xl w-20" /></div>
  </div>
);

export const UserCardSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
    <div className="flex-1"><div className="h-4 skeleton rounded w-28 mb-1" /><div className="h-3 skeleton rounded w-20" /></div>
    <div className="h-8 skeleton rounded-xl w-20" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-40 skeleton rounded-b-2xl" />
    <div className="px-4 pb-4">
      <div className="flex items-end gap-4 -mt-12 mb-4"><div className="w-24 h-24 rounded-full skeleton border-4 border-white dark:border-nexora-dark" /></div>
      <div className="h-6 skeleton rounded w-40 mb-2" /><div className="h-4 skeleton rounded w-28 mb-3" />
      <div className="h-4 skeleton rounded w-full mb-1" /><div className="h-4 skeleton rounded w-3/4 mb-4" />
    </div>
  </div>
);

export const NotificationSkeleton = () => (
  <div className="flex items-center gap-3 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
    <div className="flex-1"><div className="h-4 skeleton rounded w-3/4 mb-1" /><div className="h-3 skeleton rounded w-24" /></div>
  </div>
);

export const MessageSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-12 h-12 rounded-full skeleton flex-shrink-0" />
    <div className="flex-1"><div className="h-4 skeleton rounded w-28 mb-1" /><div className="h-3 skeleton rounded w-40" /></div>
    <div className="h-3 skeleton rounded w-12" />
  </div>
);

const Skeleton = ({ className = '' }) => <div className={'skeleton ' + className} />;
export default Skeleton;
