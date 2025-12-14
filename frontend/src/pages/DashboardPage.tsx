import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.list()
      return response.data
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Checkmate Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.full_name || user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{projects?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Tests Run</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Critical Issues</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Plan</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 capitalize">{user?.plan || 'Free'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/projects?new=true"
              className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition"
            >
              <h3 className="text-lg font-bold mb-2">Create New Project</h3>
              <p className="text-sm text-blue-100">Start testing a new website or application</p>
            </Link>
            <Link
              to="/projects"
              className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition"
            >
              <h3 className="text-lg font-bold mb-2">View Projects</h3>
              <p className="text-sm text-green-100">Manage and monitor your existing projects</p>
            </Link>
            <a
              href="/docs"
              className="bg-purple-600 text-white p-6 rounded-lg shadow hover:bg-purple-700 transition"
            >
              <h3 className="text-lg font-bold mb-2">Documentation</h3>
              <p className="text-sm text-purple-100">Learn how to get the most out of Checkmate</p>
            </a>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Projects</h2>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.slice(0, 5).map((project: any) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.target_url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.total_tests || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
              <Link
                to="/projects?new=true"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Project
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
