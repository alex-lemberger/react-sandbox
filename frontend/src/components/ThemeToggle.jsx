import { Sun, Moon } from 'lucide-react';
import { Button } from './ui';

export function ThemeToggle({ theme, toggleTheme }) {
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}