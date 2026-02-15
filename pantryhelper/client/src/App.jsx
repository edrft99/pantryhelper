import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ScanResultsPage from './pages/ScanResultsPage';
import RecipesPage from './pages/RecipesPage';
import PantryPage from './pages/PantryPage';
import FavoritesPage from './pages/FavoritesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan-results" element={<ScanResultsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
