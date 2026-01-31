import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-blue-600">
              JobConnect
            </div>
            <div className="space-x-4">
              <Link
                to="/create-job"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
              >
                Create Job
              </Link>
              <Link
                to="/browse-jobs"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect People with Workers
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            JobConnect is a social impact platform that helps homeowners and
            individuals find skilled workers for their projects. Create job
            requests or browse available opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-job"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Create a Job
            </Link>
            <Link
              to="/browse-jobs"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-600"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Create Job Requests</h3>
            <p className="text-gray-600">
              Post your job with details, location, budget, and media. Workers
              can see and respond to your requests.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Browse Opportunities</h3>
            <p className="text-gray-600">
              Workers can browse available jobs, view details, and either
              accept or make counter-offers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Connect & Collaborate</h3>
            <p className="text-gray-600">
              Direct communication between job creators and workers with
              transparent pricing and clear expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
