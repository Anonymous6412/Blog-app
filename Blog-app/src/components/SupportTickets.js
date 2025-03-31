import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { currentUser, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }
    
    if (!authLoading && !isAdmin && !isSuperAdmin) {
      navigate('/');
      return;
    }
    
    fetchTickets();
  }, [currentUser, isAdmin, isSuperAdmin, navigate, authLoading]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsRef = collection(db, 'support_tickets');
      const ticketsQuery = query(ticketsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(ticketsQuery);
      
      const ticketList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
      
      setTickets(ticketList);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        status: 'closed',
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSelectedTicket({
        ...selectedTicket,
        status: 'closed',
        updatedAt: new Date()
      });
      
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: 'closed', updatedAt: new Date() } 
          : ticket
      ));
      
      setMessage('Ticket marked as closed');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error closing ticket:', err);
      setError('Failed to close ticket');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        status: 'open',
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSelectedTicket({
        ...selectedTicket,
        status: 'open',
        updatedAt: new Date()
      });
      
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: 'open', updatedAt: new Date() } 
          : ticket
      ));
      
      setMessage('Ticket reopened');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error reopening ticket:', err);
      setError('Failed to reopen ticket');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim() || !selectedTicket) {
      return;
    }
    
    try {
      setIsReplying(true);
      
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        responses: arrayUnion({
          text: replyText,
          from: 'admin',
          adminId: currentUser.uid,
          adminEmail: currentUser.email,
          timestamp: new Date()
        }),
        status: 'responded',
        updatedAt: serverTimestamp()
      });
      
      // Refresh ticket data
      const updatedTicketSnap = await getDoc(ticketRef);
      if (updatedTicketSnap.exists()) {
        const updatedTicket = {
          id: updatedTicketSnap.id,
          ...updatedTicketSnap.data(),
          createdAt: updatedTicketSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: updatedTicketSnap.data().updatedAt?.toDate() || new Date()
        };
        
        // Update selected ticket and tickets list
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(ticket => 
          ticket.id === selectedTicket.id ? updatedTicket : ticket
        ));
        
        setReplyText('');
        setMessage('Response sent successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error sending response:', err);
      setError('Failed to send response');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsReplying(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'open') return ticket.status === 'open';
    if (activeFilter === 'closed') return ticket.status === 'closed';
    if (activeFilter === 'responded') return ticket.status === 'responded';
    if (activeFilter === 'suspended') return ticket.isSuspended;
    return true;
  });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex justify-center items-center">
        <div className="text-lg text-amber-600 animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
            Loading support tickets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Support Tickets
          </h1>
          <div className="h-1.5 w-32 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full mt-3"></div>
          <p className="mt-4 text-gray-600">
            Manage and respond to user support requests
          </p>
        </div>
        
        {/* Success/Error Messages */}
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
        
        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Tickets</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => fetchTickets()}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Refresh tickets"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filter options */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('open')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeFilter === 'open'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setActiveFilter('responded')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeFilter === 'responded'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Responded
                </button>
                <button
                  onClick={() => setActiveFilter('closed')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeFilter === 'closed'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Closed
                </button>
                <button
                  onClick={() => setActiveFilter('suspended')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeFilter === 'suspended'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Suspended Users
                </button>
              </div>
              
              {/* Ticket list */}
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                {filteredTickets.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTickets.map(ticket => (
                      <div 
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {ticket.subject}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {ticket.userEmail}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            {ticket.isSuspended && (
                              <span className="inline-flex items-center px-2 py-0.5 mr-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                Suspended
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              ticket.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : ticket.status === 'responded'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status === 'open' ? 'Open' : 
                               ticket.status === 'responded' ? 'Responded' : 'Closed'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {ticket.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeFilter !== 'all' 
                        ? `No ${activeFilter} tickets available.` 
                        : 'There are no support tickets to display.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              {selectedTicket ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{selectedTicket.subject}</h2>
                      <div className="flex items-center mt-2">
                        <div className="mr-4 flex">
                          <svg className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-gray-600">{selectedTicket.userEmail}</span>
                        </div>
                        <div className="flex">
                          <svg className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {new Date(selectedTicket.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedTicket.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : selectedTicket.status === 'responded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedTicket.status === 'open' ? 'Open' : 
                           selectedTicket.status === 'responded' ? 'Responded' : 'Closed'}
                        </span>
                        {selectedTicket.isSuspended && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Suspended Account
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      {selectedTicket.status !== 'closed' ? (
                        <button
                          onClick={handleCloseTicket}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Close Ticket
                        </button>
                      ) : (
                        <button
                          onClick={handleReopenTicket}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reopen Ticket
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto">
                    {/* Initial message */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Initial Message:</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                      </div>
                    </div>
                    
                    {/* Responses */}
                    {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-800 mb-4">Responses:</h3>
                        <div className="space-y-6">
                          {selectedTicket.responses.map((response, index) => (
                            <div 
                              key={index}
                              className={`flex ${response.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-md p-4 rounded-lg ${
                                response.from === 'admin' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <div className="flex items-center mb-2">
                                  <span className={`text-xs font-medium ${
                                    response.from === 'admin' ? 'text-indigo-600' : 'text-gray-600'
                                  }`}>
                                    {response.from === 'admin' 
                                      ? `Admin (${response.adminEmail})` 
                                      : `User (${selectedTicket.userEmail})`}
                                  </span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(response.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{response.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Reply form */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Reply to this ticket:</h3>
                      <form onSubmit={handleSubmitReply}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows={4}
                          placeholder="Type your response here..."
                          required
                          disabled={isReplying}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            type="submit"
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              isReplying ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                            disabled={isReplying}
                          >
                            {isReplying ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                              </>
                            ) : 'Send Response'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <svg className="h-16 w-16 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-xl font-medium text-gray-900">No ticket selected</h3>
                  <p className="mt-1 text-gray-500 max-w-md">
                    Select a ticket from the list to view its details and respond to the user.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets; 