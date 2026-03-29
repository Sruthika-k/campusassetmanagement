import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-shell App">
      <Navbar />
      <main className="main-content">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
