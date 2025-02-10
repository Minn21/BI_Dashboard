import Skeleton from 'react-loading-skeleton';

export default function LoadingCard() {
  return (
    <div className="bg-black p-6 rounded-xl shadow-lg">
      <Skeleton height={20} width={100} />
      <Skeleton height={30} width={150} className="mt-2" />
    </div>
  );
}