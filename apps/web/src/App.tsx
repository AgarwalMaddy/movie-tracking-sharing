import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "./auth"
import { Shell } from "./components/ui"
import {
  Activity,
  CollectionsPage,
  Discover,
  Friends,
  HistoryPage,
  Inbox,
  Landing,
  Library,
  ListDetail,
  ListsPage,
  Login,
  Profile,
  ReviewsPage,
  SearchPage,
  Signup,
  StatsPage,
  TitlePage,
} from "./pages"

function Guard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  if (!ready) return <main className="page">Loading…</main>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
