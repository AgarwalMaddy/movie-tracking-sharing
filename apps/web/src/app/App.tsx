import { type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from '@/features/auth';
import { Activity } from '@/pages/activity';
import { CollectionsPage } from '@/pages/collections';
import { Discover } from '@/pages/discover';
import { Friends } from '@/pages/friends';
import { HistoryPage } from '@/pages/history';
import { Inbox } from '@/pages/inbox';
import { Landing } from '@/pages/landing';
import { Library } from '@/pages/library';
import { ListDetail } from '@/pages/list-detail';
import { ListsPage } from '@/pages/lists';
import { Login } from '@/pages/login';
import { Profile } from '@/pages/profile';
import { ReviewsPage } from '@/pages/reviews';
import { SearchPage } from '@/pages/search';
import { Signup } from '@/pages/signup';
import { StatsPage } from '@/pages/stats';
import { TitlePage } from '@/pages/title';

import { Shell } from './shell';

function Guard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <main className="page">Loading…</main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/title/:mediaType/:tmdbId" element={<TitlePage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/u/:username/list/:slug" element={<ListDetail />} />
        <Route
          path="/library"
          element={
            <Guard>
              <Library />
            </Guard>
          }
        />
        <Route
          path="/lists"
          element={
            <Guard>
              <ListsPage />
            </Guard>
          }
        />
        <Route
          path="/history"
          element={
            <Guard>
              <HistoryPage />
            </Guard>
          }
        />
        <Route
          path="/activity"
          element={
            <Guard>
              <Activity />
            </Guard>
          }
        />
        <Route
          path="/friends"
          element={
            <Guard>
              <Friends />
            </Guard>
          }
        />
        <Route
          path="/inbox"
          element={
            <Guard>
              <Inbox />
            </Guard>
          }
        />
        <Route
          path="/stats"
          element={
            <Guard>
              <StatsPage />
            </Guard>
          }
        />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
