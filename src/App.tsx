import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateJob } from './pages/CreateJob';
import { BrowseJobs } from './pages/BrowseJobs';
import { JobDetails } from './pages/JobDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
