'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FaCheck, FaTimes, FaSpinner, FaBook, FaExternalLinkAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

type TabType = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          chapters (
            name,
            subjects (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'published' | 'rejected') => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('notes')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Note ${action === 'published' ? 'approved' : 'rejected'} successfully!`);
      // Update local state
      setNotes(notes.map(note => 
        note.id === id ? { ...note, status: action } : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNotes = notes.filter(note => {
    switch (activeTab) {
      case 'pending':
        return note.status === 'pending';
      case 'approved':
        return note.status === 'published';
      case 'rejected':
        return note.status === 'rejected';
      default:
        return true;
    }
  });

  const tabs = [
    { id: 'pending', label: 'Pending Review', icon: FaClock, count: notes.filter(n => n.status === 'pending').length },
    { id: 'approved', label: 'Approved', icon: FaCheckCircle, count: notes.filter(n => n.status === 'published').length },
    { id: 'rejected', label: 'Rejected', icon: FaTimesCircle, count: notes.filter(n => n.status === 'rejected').length },
    { id: 'all', label: 'All Notes', icon: FaBook, count: notes.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark p-4 sm:p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-dark-light rounded-xl p-6 shadow-lg border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-8 flex items-center">
            <FaBook className="mr-2" />
            Manage Notes
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark text-gray-400 hover:bg-dark-light'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="bg-dark-light px-2 py-0.5 rounded-full text-sm">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {filteredNotes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No notes found in this section</p>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-dark rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-white">{note.title}</h3>
                      <p className="text-sm text-gray-400">
                        {note.chapters?.subjects?.name} &gt; {note.chapters?.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-400 flex items-center"
                        >
                          View Note <FaExternalLinkAlt className="ml-1 w-3 h-3" />
                        </a>
                        <span className="text-sm text-gray-500">•</span>
                        <span className={`text-sm ${
                          note.status === 'pending' ? 'text-yellow-500' :
                          note.status === 'published' ? 'text-green-500' :
                          'text-red-500'
                        }`}>
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-400">
                          Added {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {note.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(note.id, 'published')}
                          disabled={actionLoading === note.id}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve Note"
                        >
                          {actionLoading === note.id ? (
                            <FaSpinner className="animate-spin w-5 h-5" />
                          ) : (
                            <FaCheck className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(note.id, 'rejected')}
                          disabled={actionLoading === note.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject Note"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
