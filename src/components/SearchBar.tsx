export default function SearchBar() {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search guests..."
          className="w-full p-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
      </div>
    );
  }