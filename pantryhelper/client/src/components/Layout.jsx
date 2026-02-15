import { NavLink, Outlet } from 'react-router-dom';
import { Camera, UtensilsCrossed, Refrigerator, Heart } from 'lucide-react';

export default function Layout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-100 text-emerald-800'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PantryHelper</span>
          </NavLink>
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              <Camera className="w-4 h-4" /> Scan
            </NavLink>
            <NavLink to="/pantry" className={linkClass}>
              <Refrigerator className="w-4 h-4" /> Pantry
            </NavLink>
            <NavLink to="/favorites" className={linkClass}>
              <Heart className="w-4 h-4" /> Favorites
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around py-2">
        <NavLink to="/" end className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-emerald-600' : 'text-gray-500'}`
        }>
          <Camera className="w-5 h-5" />
          Scan
        </NavLink>
        <NavLink to="/pantry" className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-emerald-600' : 'text-gray-500'}`
        }>
          <Refrigerator className="w-5 h-5" />
          Pantry
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-emerald-600' : 'text-gray-500'}`
        }>
          <Heart className="w-5 h-5" />
          Favorites
        </NavLink>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
