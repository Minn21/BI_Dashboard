import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}