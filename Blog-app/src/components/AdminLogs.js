import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const { getActivityLogs, currentUser, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const logsData = await getActivityLogs();
      setLogs(logsData);
      setError('');
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getActivityLogs]);
  
  // Redirect non-admin users away from this page
  useEffect(() => {
    if (loading) return;
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isSuperAdmin) {
      navigate('/');
      return;
    }
    
    fetchLogs();
  }, [currentUser, isSuperAdmin, navigate, loading, fetchLogs]);

  // Filter logs based on search term and filter type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && log.action === filterType;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchLogs();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionColor = (action) => {
    switch (true) {
      case action.includes('create'):
        return 'bg-green-100 text-green-800';
      case action.includes('edit'):
        return 'bg-blue-100 text-blue-800';
      case action.includes('delete'):
        return 'bg-red-100 text-red-800';
      case action.includes('restore'):
        return 'bg-purple-100 text-purple-800';
      case action.includes('admin'):
        return 'bg-amber-100 text-amber-800';
      case action.includes('permissions'):
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination calculations
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            Loading activity logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
            Activity Logs
          </h1>
          <div className="h-1.5 w-40 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full mt-3"></div>
          <p className="mt-4 text-gray-600">
            Track all system activities and changes
          </p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and filter controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by action</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="all">All Activities</option>
                    <option value="create">Create Actions</option>
                    <option value="edit">Edit Actions</option>
                    <option value="delete">Delete Actions</option>
                    <option value="restore">Restore Actions</option>
                    <option value="admin">Admin Status Changes</option>
                    <option value="permissions">Permission Changes</option>
                  </select>
                </div>
                
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search logs</label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search by user, action, or details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow rounded-l-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Logs Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {filteredLogs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{log.userEmail}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-md overflow-hidden overflow-ellipsis">
                            {typeof log.details === 'object' ? 
                              <pre className="text-xs overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre> : 
                              log.details}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastLog, filteredLogs.length)}</span> of{" "}
                    <span className="font-medium">{filteredLogs.length}</span> logs
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.ceil(filteredLogs.length / logsPerPage) }, (_, i) => i + 1)
                      .filter(num => 
                        num === 1 || 
                        num === Math.ceil(filteredLogs.length / logsPerPage) || 
                        (num >= currentPage - 1 && num <= currentPage + 1)
                      )
                      .map((number) => (
                        <React.Fragment key={number}>
                          {number > 1 && 
                           number === Math.ceil(filteredLogs.length / logsPerPage) && 
                           currentPage < Math.ceil(filteredLogs.length / logsPerPage) - 1 && (
                            <span className="self-center">...</span>
                          )}
                          
                          <button
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded ${
                              currentPage === number
                                ? "bg-indigo-600 text-white"
                                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            }`}
                          >
                            {number}
                          </button>
                          
                          {number < Math.ceil(filteredLogs.length / logsPerPage) && 
                           number === 1 && 
                           currentPage > 2 && (
                            <span className="self-center">...</span>
                          )}
                        </React.Fragment>
                      ))}
                      
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredLogs.length / logsPerPage)}
                      className={`px-3 py-1 rounded ${
                        currentPage === Math.ceil(filteredLogs.length / logsPerPage)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg text-gray-600">No activity logs found</p>
              <p className="text-sm text-gray-500 mt-2">Activity logs will appear here when users perform actions in the system</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs; 