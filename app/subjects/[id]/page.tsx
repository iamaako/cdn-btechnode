'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AtomLoader from '@/components/AtomLoader';
import { supabase } from '@/lib/supabase';
import { FaYoutube, FaChevronRight, FaSearch, FaArrowLeft, FaBookmark } from 'react-icons/fa';
import { MdPlayLesson } from 'react-icons/md';

// Define color schemes (same as in subjects page)
const colorSchemes = [
  {
    name: 'rose',
    border: 'hover:border-rose-500/50',
    shadow: 'hover:shadow-rose-500/20',
    text: 'text-rose-500',
    icon: 'text-rose-500',
    dots: ['bg-rose-400', 'bg-rose-500', 'bg-rose-600'],
    gradient: 'from-rose-500/0 via-rose-500/50 to-rose-500/0'
  },
  {
    name: 'blue',
    border: 'hover:border-blue-500/50',
    shadow: 'hover:shadow-blue-500/20',
    text: 'text-blue-500',
    icon: 'text-blue-500',
    dots: ['bg-blue-400', 'bg-blue-500', 'bg-blue-600'],
    gradient: 'from-blue-500/0 via-blue-500/50 to-blue-500/0'
  },
  {
    name: 'amber',
    border: 'hover:border-amber-500/50',
    shadow: 'hover:shadow-amber-500/20',
    text: 'text-amber-500',
    icon: 'text-amber-500',
    dots: ['bg-amber-400', 'bg-amber-500', 'bg-amber-600'],
    gradient: 'from-amber-500/0 via-amber-500/50 to-amber-500/0'
  },
  {
    name: 'emerald',
    border: 'hover:border-emerald-500/50',
    shadow: 'hover:shadow-emerald-500/20',
    text: 'text-emerald-500',
    icon: 'text-emerald-500',
    dots: ['bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'],
    gradient: 'from-emerald-500/0 via-emerald-500/50 to-emerald-500/0'
  },
  {
    name: 'violet',
    border: 'hover:border-violet-500/50',
    shadow: 'hover:shadow-violet-500/20',
    text: 'text-violet-500',
    icon: 'text-violet-500',
    dots: ['bg-violet-400', 'bg-violet-500', 'bg-violet-600'],
    gradient: 'from-violet-500/0 via-violet-500/50 to-violet-500/0'
  },
  {
    name: 'cyan',
    border: 'hover:border-cyan-500/50',
    shadow: 'hover:shadow-cyan-500/20',
    text: 'text-cyan-500',
    icon: 'text-cyan-500',
    dots: ['bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600'],
    gradient: 'from-cyan-500/0 via-cyan-500/50 to-cyan-500/0'
  },
  {
    name: 'fuchsia',
    border: 'hover:border-fuchsia-500/50',
    shadow: 'hover:shadow-fuchsia-500/20',
    text: 'text-fuchsia-500',
    icon: 'text-fuchsia-500',
    dots: ['bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600'],
    gradient: 'from-fuchsia-500/0 via-fuchsia-500/50 to-fuchsia-500/0'
  },
  {
    name: 'lime',
    border: 'hover:border-lime-500/50',
    shadow: 'hover:shadow-lime-500/20',
    text: 'text-lime-500',
    icon: 'text-lime-500',
    dots: ['bg-lime-400', 'bg-lime-500', 'bg-lime-600'],
    gradient: 'from-lime-500/0 via-lime-500/50 to-lime-500/0'
  }
];

export default function SubjectDetail() {
  const params = useParams();
  const [subject, setSubject] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);

  useEffect(() => {
    if (params.id) {
      fetchSubjectAndChapters();
    }

    // Get color from localStorage
    const colorAssignments: { [key: string]: string } = JSON.parse(localStorage.getItem('subjectColors') || '{}');
    const colorName = colorAssignments[params.id as string];
    const scheme = colorSchemes.find(s => s.name === colorName) || colorSchemes[0];
    setColorScheme(scheme);
  }, [params.id]);

  async function fetchSubjectAndChapters() {
    try {
      // Fetch subject details
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch chapters with playlist count
      await fetchChapterAndPlaylists();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function fetchChapterAndPlaylists() {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select(`
          *,
          subjects(*),
          playlists(count),
          notes(count)
        `)
        .eq('subject_id', params.id)
        .order('name');

      if (chapterError) throw chapterError;

      // Transform data to include playlist and notes count
      const transformedData = chapterData?.map(chapter => ({
        ...chapter,
        playlists_count: chapter.playlists[0]?.count || 0,
        notes_count: chapter.notes[0]?.count || 0
      }));

      setChapters(transformedData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AtomLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Back button and Title Section */}
      <div className="bg-dark-light/10 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          <Link 
            href="/subjects"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            <span className="ml-1">Back to Subjects</span>
          </Link>
          
          <h1 className={`text-4xl font-bold text-center ${colorScheme.text} mb-8`}>
            {subject?.name}
          </h1>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 pl-8 rounded-md bg-dark-light/30 text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
              />
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 reveal-grid">
          {filteredChapters.map((chapter) => (
            <Link 
              key={chapter.id}
              href={`/chapters/${chapter.id}`}
              className="block group reveal-card"
            >
              <div className={`bg-dark-light/20 backdrop-blur-sm rounded-lg p-4 hover:bg-dark-light/30 transition-all duration-300 transform hover:translate-x-2 border border-gray-800/30 ${colorScheme.border} shadow-lg ${colorScheme.shadow} shiny-card`}>
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`${colorScheme.icon}`}>
                        <MdPlayLesson size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-medium text-white group-hover:${colorScheme.text} transition-colors truncate`}>
                          {chapter.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <FaYoutube className={`w-3 h-3 ${colorScheme.icon}`} />
                            <span className="text-xs text-gray-400">
                              {chapter.playlists_count || 0} Playlists
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaBookmark className={`w-3 h-3 ${colorScheme.icon}`} />
                            <span className="text-xs text-gray-400">
                              {chapter.notes_count || 0} Notes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`text-gray-400 group-hover:${colorScheme.text} transition-colors ml-4`}>
                      <FaChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredChapters.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              No chapters available for this subject yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
