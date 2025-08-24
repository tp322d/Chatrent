import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageSquare, Clock, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const History = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [pagination.current]);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/history?page=${page}&limit=10`);
      setChats(response.data.chats);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await axios.delete(`/api/chat/${chatId}`);
      toast.success('Chat deleted successfully');
      fetchHistory(pagination.current);
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const viewChat = async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}`);
      setSelectedChat(response.data.chat);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load chat details');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Anthropic';
      case 'google': return 'Google';
      default: return provider;
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'openai': return 'bg-green-100 text-green-800';
      case 'anthropic': return 'bg-orange-100 text-orange-800';
      case 'google': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
        <p className="mt-2 text-gray-600">
          View and manage your previous AI model comparisons
        </p>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat history yet</h3>
          <p className="text-gray-600 mb-4">Start a conversation to see your chat history here</p>
          <a href="/chat" className="btn btn-primary">
            Start Chatting
          </a>
        </div>
      ) : (
        <>
          {/* Chat List */}
          <div className="space-y-4">
            {chats.map((chat) => (
              <div key={chat._id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {formatDate(chat.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                      {chat.prompt}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {chat.responses.map((response, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderColor(response.provider)}`}
                        >
                          {getProviderName(response.provider)}
                          {response.error && (
                            <span className="ml-1 text-red-600">✕</span>
                          )}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Total response time: {chat.metadata?.totalResponseTime}ms
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => viewChat(chat._id)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteChat(chat._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => fetchHistory(pagination.current - 1)}
                disabled={!pagination.hasPrev || loading}
                className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.current} of {pagination.total}
              </span>
              
              <button
                onClick={() => fetchHistory(pagination.current + 1)}
                disabled={!pagination.hasNext || loading}
                className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Chat Detail Modal */}
      {showModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Chat Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(selectedChat.createdAt)}
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Prompt */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Prompt</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedChat.prompt}</p>
                  </div>
                </div>
                
                {/* Responses */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Responses</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {selectedChat.responses.map((response, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{getProviderName(response.provider)}</h4>
                            <p className="text-sm text-gray-600">{response.model}</p>
                          </div>
                          {response.error ? (
                            <span className="text-red-500 text-xs">Error</span>
                          ) : (
                            <span className="text-green-500 text-xs">Success</span>
                          )}
                        </div>
                        
                        {response.error ? (
                          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                            {response.error}
                          </div>
                        ) : (
                          <>
                            <div className="prose prose-sm max-w-none mb-3">
                              <p className="whitespace-pre-wrap text-sm">{response.response}</p>
                            </div>
                            
                            {response.tokenUsage && (
                              <div className="text-xs text-gray-500 border-t pt-2">
                                <div>Tokens: {response.tokenUsage.totalTokens}</div>
                                <div>Time: {response.responseTime}ms</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;