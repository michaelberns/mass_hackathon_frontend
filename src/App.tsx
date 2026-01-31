import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { CreateUser } from './pages/CreateUser';
import { UserProfile } from './pages/UserProfile';
import { EditUser } from './pages/EditUser';
import { CreateJob } from './pages/CreateJob';
import { BrowseJobs } from './pages/BrowseJobs';
import { JobDetails } from './pages/JobDetails';
import { EditJob } from './pages/EditJob';
import { Onboarding } from './pages/Onboarding';
import { MapPage } from './pages/MapPage';

function App() {
  return (
    <UserProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/users/new" element={<CreateUser />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/users/:id/edit" element={<EditUser />} />
            <Route path="/jobs" element={<BrowseJobs />} />
            <Route path="/jobs/map" element={<MapPage />} />
            <Route path="/jobs/new" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/jobs/:id/edit" element={<EditJob />} />
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </UserProvider>
  );
}

export default App;
