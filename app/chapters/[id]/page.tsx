'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AtomLoader from '@/components/AtomLoader';
import { supabase } from '@/lib/supabase';
import { FaYoutube, FaArrowLeft, FaPlay, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { Notebook, Note, BookOpen, FileText } from "@phosphor-icons/react";

// Define color schemes (same as in subjects page)
const colorSchemes = [
  {
    name: 'rose',
    border: 'hover:border-rose-500/50',
    shadow: 'hover:shadow-rose-500/20',
    text: 'text-rose-500',
    icon: 'text-rose-500',
    dots: ['bg-rose-400', 'bg-rose-500', 'bg-rose-600'],
    gradient: 'from-rose-500/0 via-rose-500/50 to-rose-500/0',
    from: 'rose-500',
    fromHex: '#ec4899',
    to: 'rose-500',
    toHex: '#ec4899'
  },
  {
    name: 'blue',
    border: 'hover:border-blue-500/50',
    shadow: 'hover:shadow-blue-500/20',
    text: 'text-blue-500',
    icon: 'text-blue-500',
    dots: ['bg-blue-400', 'bg-blue-500', 'bg-blue-600'],
    gradient: 'from-blue-500/0 via-blue-500/50 to-blue-500/0',
    from: 'blue-500',
    fromHex: '#3b82f6',
    to: 'blue-500',
    toHex: '#3b82f6'
  },
  {
    name: 'amber',
    border: 'hover:border-amber-500/50',
    shadow: 'hover:shadow-amber-500/20',
    text: 'text-amber-500',
    icon: 'text-amber-500',
    dots: ['bg-amber-400', 'bg-amber-500', 'bg-amber-600'],
    gradient: 'from-amber-500/0 via-amber-500/50 to-amber-500/0',
    from: 'amber-500',
    fromHex: '#f59e0b',
    to: 'amber-500',
    toHex: '#f59e0b'
  },
  {
    name: 'emerald',
    border: 'hover:border-emerald-500/50',
    shadow: 'hover:shadow-emerald-500/20',
    text: 'text-emerald-500',
    icon: 'text-emerald-500',
    dots: ['bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'],
    gradient: 'from-emerald-500/0 via-emerald-500/50 to-emerald-500/0',
    from: 'emerald-500',
    fromHex: '#34d399',
    to: 'emerald-500',
    toHex: '#34d399'
  },
  {
    name: 'violet',
    border: 'hover:border-violet-500/50',
    shadow: 'hover:shadow-violet-500/20',
    text: 'text-violet-500',
    icon: 'text-violet-500',
    dots: ['bg-violet-400', 'bg-violet-500', 'bg-violet-600'],
    gradient: 'from-violet-500/0 via-violet-500/50 to-violet-500/0',
    from: 'violet-500',
    fromHex: '#8b5cf6',
    to: 'violet-500',
    toHex: '#8b5cf6'
  },
  {
    name: 'cyan',
    border: 'hover:border-cyan-500/50',
    shadow: 'hover:shadow-cyan-500/20',
    text: 'text-cyan-500',
    icon: 'text-cyan-500',
    dots: ['bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600'],
    gradient: 'from-cyan-500/0 via-cyan-500/50 to-cyan-500/0',
    from: 'cyan-500',
    fromHex: '#06b6d4',
    to: 'cyan-500',
    toHex: '#06b6d4'
  },
  {
    name: 'fuchsia',
    border: 'hover:border-fuchsia-500/50',
    shadow: 'hover:shadow-fuchsia-500/20',
    text: 'text-fuchsia-500',
    icon: 'text-fuchsia-500',
    dots: ['bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600'],
    gradient: 'from-fuchsia-500/0 via-fuchsia-500/50 to-fuchsia-500/0',
    from: 'fuchsia-500',
    fromHex: '#c026d3',
    to: 'fuchsia-500',
    toHex: '#c026d3'
  },
  {
    name: 'lime',
    border: 'hover:border-lime-500/50',
    shadow: 'hover:shadow-lime-500/20',
    text: 'text-lime-500',
    icon: 'text-lime-500',
    dots: ['bg-lime-400', 'bg-lime-500', 'bg-lime-600'],
    gradient: 'from-lime-500/0 via-lime-500/50 to-lime-500/0',
    from: 'lime-500',
    fromHex: '#a3e635',
    to: 'lime-500',
    toHex: '#a3e635'
  }
];

export default function ChapterDetail() {
  const params = useParams();
  const [chapter, setChapter] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
  const [activeTab, setActiveTab] = useState<'playlists' | 'notes'>('playlists');

  useEffect(() => {
    if (params.id) {
      fetchChapterAndPlaylists();
      fetchNotes();
    }
  }, [params.id]);

  const fetchChapterAndPlaylists = async () => {
    try {
      // Fetch chapter details
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*, subjects(*)')
        .eq('id', params.id)
        .single();

      if (chapterError) throw chapterError;

      setChapter(chapterData);
      setSubject(chapterData.subjects);

      // Get color scheme from localStorage using subject_id
      const colorAssignments = JSON.parse(localStorage.getItem('subjectColors') || '{}');
      const colorName = colorAssignments[chapterData.subject_id];
      const scheme = colorSchemes.find(s => s.name === colorName) || colorSchemes[0];
      setColorScheme(scheme);

      // Fetch approved playlists for this chapter
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('chapter_id', params.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;

      setPlaylists(playlistsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('chapter_id', params.id)
        .eq('status', 'published');

      if (notesError) throw notesError;

      setNotes(notesData);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center">
          <AtomLoader />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark to-dark-light">
      <Navbar />
      
      {/* Back button and Title Section */}
      <div className="bg-dark-light/10 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          <Link
            href={`/subjects/${subject?.id}`}
            className="inline-flex items-center text-gray-400 hover:text-white mb-6"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Chapter
          </Link>
          
          <h1 className={`text-4xl font-bold text-center animate-pulse-glow mb-8 ${colorScheme.text}`}>
            {chapter?.name}
          </h1>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 pl-8 rounded-md bg-dark-light/30 text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
              />
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center items-center mb-8">
        <div className="bg-dark-light/20 backdrop-blur-md p-1.5 rounded-xl">
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('playlists')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-500 ease-out transform hover:scale-105 ${
                activeTab === 'playlists'
                  ? `bg-gradient-to-r from-${colorScheme.from} to-${colorScheme.to} text-white shadow-lg scale-105`
                  : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              style={{
                background: activeTab === 'playlists' 
                  ? `linear-gradient(to right, ${colorScheme.fromHex}, ${colorScheme.toHex})`
                  : ''
              }}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-500 ease-out transform hover:scale-105 ${
                activeTab === 'notes'
                  ? `bg-gradient-to-r from-${colorScheme.from} to-${colorScheme.to} text-white shadow-lg scale-105`
                  : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              style={{
                background: activeTab === 'notes'
                  ? `linear-gradient(to right, ${colorScheme.fromHex}, ${colorScheme.toHex})`
                  : ''
              }}
            >
              Notes
            </button>
          </div>
        </div>
      </div>

      {/* Content Container with Smooth Transition */}
      <div className="transition-all duration-500 ease-out">
        {activeTab === 'playlists' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 reveal-grid">
              {filteredPlaylists.map((playlist) => (
                <a
                  key={playlist.id}
                  href={playlist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-dark-light/20 backdrop-blur-sm rounded-lg p-4 hover:bg-dark-light/30 transition-all duration-300 flex flex-col reveal-card shiny-card"
                >
                  <div className="card-content">
                    <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-md">
                      <img
                        src={playlist.thumbnail_url || `https://img.youtube.com/vi/${playlist.url.split('v=')[1]}/maxresdefault.jpg`}
                        alt={playlist.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <FaPlay className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    <h3 className={`font-medium text-sm mb-2 line-clamp-2 group-hover:text-${colorScheme.text} transition-colors`}>
                      {playlist.title}
                    </h3>
                    <div className="mt-auto flex items-center text-xs text-gray-400">
                      <FaYoutube className={`w-4 h-4 mr-1 ${colorScheme.icon}`} />
                      <span>Watch on YouTube</span>
                    </div>
                  </div>
                </a>
              ))}

              {filteredPlaylists.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No playlists found matching your search.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 reveal-grid">
              {filteredNotes.map((note) => (
                <a
                  key={note.id}
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-dark-light/20 backdrop-blur-sm rounded-lg p-6 hover:bg-dark-light/30 transition-all duration-300 flex flex-col reveal-card shiny-card"
                >
                  <div className="card-content flex flex-col items-center justify-center">
                    <div className="flex-shrink-0 mb-4">
                      <FileText 
                        size={72} 
                        weight="duotone"
                        className={`${colorScheme.icon} group-hover:scale-110 transition-transform duration-300 drop-shadow-lg`}
                      />
                    </div>
                    <div className="w-full text-center mt-2">
                      <h3 className={`text-xs text-gray-400 line-clamp-2 group-hover:text-${colorScheme.text} transition-colors`}>
                        {note.title}
                      </h3>
                    </div>
                  </div>
                </a>
              ))}

              {filteredNotes.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No notes found matching your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
