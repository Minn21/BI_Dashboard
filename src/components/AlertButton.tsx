import toast from 'react-hot-toast';

export default function AlertButton() {
  const handleClick = () => {
    toast.error('High cancellation rate detected!');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      Show Alert
    </button>
  );
}