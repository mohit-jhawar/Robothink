import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import StickyMobileCTA from './components/StickyMobileCTA';
import AnalyticsTracker from './components/AnalyticsTracker';
import HomePage from './pages/HomePage';
import RoboticsPage from './pages/RoboticsPage';
import CodingPage from './pages/CodingPage';
import CampsPage from './pages/CampsPage';
import SchoolsPage from './pages/SchoolsPage';
import ParentsPage from './pages/ParentsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BrightInnovatorsPage from './pages/BrightInnovatorsPage';
import NotFoundPage from './pages/NotFoundPage';

// Split off routes that aren't part of the primary marketing funnel so the
// admin dashboard and detail/checkout pages don't weigh down the initial load.
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ThemeDetailPage = lazy(() => import('./pages/ThemeDetailPage'));
const ProgramDetailPage = lazy(() => import('./pages/ProgramDetailPage'));
const RegisterSuccessPage = lazy(() => import('./pages/RegisterSuccessPage'));
const RegisterCancelPage = lazy(() => import('./pages/RegisterCancelPage'));

function RouteFallback() {
  return (
    <div className="section" style={{ minHeight: '50vh' }}>
      <div className="container"><p>Loading…</p></div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <AnalyticsTracker />
      <Navbar />
      <main className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/robotics" element={<RoboticsPage />} />
              <Route path="/coding" element={<CodingPage />} />
              <Route path="/camps-parties" element={<CampsPage />} />
              <Route path="/schools" element={<SchoolsPage />} />
              <Route path="/parents" element={<ParentsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/bright-innovators" element={<BrightInnovatorsPage />} />
              <Route path="/themes/:themeId" element={<ThemeDetailPage />} />
              <Route path="/programs/:id" element={<ProgramDetailPage />} />
              <Route path="/register/success" element={<RegisterSuccessPage />} />
              <Route path="/register/cancel" element={<RegisterCancelPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
