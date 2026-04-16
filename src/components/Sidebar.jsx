import { NavLink } from "react-router-dom";
import { ShoppingCart, Settings, HelpCircle } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-[#fafafa] border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-2">
          <span className="text-white font-bold text-xl">GP</span>
        </div>
        <span className="text-xs text-gray-400 tracking-widest">GROW PATH</span>
        <span className="text-lg font-bold">
          <span className="text-gray-800">Grow</span>
          <span className="text-orange-500">Path</span>
        </span>
      </div>

      {/* Main Menu */}
      <div className="px-4 mt-4">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">MAIN MENU</p>
      </div>

      <nav className="flex-1 px-3">
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "text-gray-500 hover:bg-gray-100"
            }`
          }
        >
          <ShoppingCart size={18} />
          Sales Orders
        </NavLink>
      </nav>

      {/* Bottom Links */}
      <div className="px-3 pb-6 space-y-1">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 w-full">
          <Settings size={16} />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 w-full">
          <HelpCircle size={16} />
          Help & Support
        </button>
      </div>
    </aside>
  );
}
