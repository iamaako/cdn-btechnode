'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AtomLoader from '@/components/AtomLoader';
import { FaFolder, FaSearch, FaYoutube, FaArrowLeft } from 'react-icons/fa';
import { MdPlayLesson } from 'react-icons/md';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define color schemes for subjects
const colorSchemes = [
  {
    name: 'rose',
    border: 'hover:border-rose-500/50',
    shadow: 'hover:shadow-rose-500/20',
    text: 'group-hover:text-rose-500',
    icon: 'text-rose-500',
    dots: ['bg-rose-400', 'bg-rose-500', 'bg-rose-600'],
    gradient: 'from-rose-500/0 via-rose-500/50 to-rose-500/0'
  },
  {
    name: 'blue',
    border: 'hover:border-blue-500/50',
    shadow: 'hover:shadow-blue-500/20',
    text: 'group-hover:text-blue-500',
    icon: 'text-blue-500',
    dots: ['bg-blue-400', 'bg-blue-500', 'bg-blue-600'],
    gradient: 'from-blue-500/0 via-blue-500/50 to-blue-500/0'
  },
  {
    name: 'amber',
    border: 'hover:border-amber-500/50',
    shadow: 'hover:shadow-amber-500/20',
    text: 'group-hover:text-amber-500',
    icon: 'text-amber-500',
    dots: ['bg-amber-400', 'bg-amber-500', 'bg-amber-600'],
    gradient: 'from-amber-500/0 via-amber-500/50 to-amber-500/0'
  },
  {
    name: 'emerald',
    border: 'hover:border-emerald-500/50',
    shadow: 'hover:shadow-emerald-500/20',
    text: 'group-hover:text-emerald-500',
    icon: 'text-emerald-500',
    dots: ['bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'],
    gradient: 'from-emerald-500/0 via-emerald-500/50 to-emerald-500/0'
  },
  {
    name: 'violet',
    border: 'hover:border-violet-500/50',
    shadow: 'hover:shadow-violet-500/20',
    text: 'group-hover:text-violet-500',
    icon: 'text-violet-500',
    dots: ['bg-violet-400', 'bg-violet-500', 'bg-violet-600'],
    gradient: 'from-violet-500/0 via-violet-500/50 to-violet-500/0'
  },
  {
    name: 'cyan',
    border: 'hover:border-cyan-500/50',
    shadow: 'hover:shadow-cyan-500/20',
    text: 'group-hover:text-cyan-500',
    icon: 'text-cyan-500',
    dots: ['bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600'],
    gradient: 'from-cyan-500/0 via-cyan-500/50 to-cyan-500/0'
  },
  {
    name: 'fuchsia',
    border: 'hover:border-fuchsia-500/50',
    shadow: 'hover:shadow-fuchsia-500/20',
    text: 'group-hover:text-fuchsia-500',
    icon: 'text-fuchsia-500',
    dots: ['bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600'],
    gradient: 'from-fuchsia-500/0 via-fuchsia-500/50 to-fuchsia-500/0'
  },
  {
    name: 'lime',
    border: 'hover:border-lime-500/50',
    shadow: 'hover:shadow-lime-500/20',
    text: 'group-hover:text-lime-500',
    icon: 'text-lime-500',
    dots: ['bg-lime-400', 'bg-lime-500', 'bg-lime-600'],
    gradient: 'from-lime-500/0 via-lime-500/50 to-lime-500/0'
  }
];

export default function Subjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Save color assignments to localStorage
    const colorAssignments = subjects.reduce((acc, subject, index) => {
      acc[subject.id] = colorSchemes[index % colorSchemes.length].name;
      return acc;
    }, {});
    if (subjects.length > 0) {
      localStorage.setItem('subjectColors', JSON.stringify(colorAssignments));
    }
  }, [subjects]);

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          chapters:chapters(count),
          playlists:playlists(count)
        `)
        .order('name');

      if (error) throw error;

      // Transform the data to include counts
      const transformedData = data?.map(subject => ({
        ...subject,
        chapters_count: subject.chapters[0]?.count || 0,
        playlists_count: subject.playlists[0]?.count || 0
      }));
      
      setSubjects(transformedData || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AtomLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      {/* AKTU Notes Dialog */}
      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-dark-light p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Important Notice
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">
                      Currently, only AKTU notes and study materials are available. Materials for other colleges will be added in the coming days.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Got it
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <main className="pt-16">
        {/* Back to Home Button */}
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            Subjects
          </h1>

          {/* Search Section */}
          <div className="mb-8">
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-dark-light/20 backdrop-blur-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSubjects.map((subject, index) => {
                const colorScheme = colorSchemes[index % colorSchemes.length];
                
                return (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="group relative bg-dark-light/20 backdrop-blur-sm rounded-xl p-6 hover:bg-dark-light/30 transition-all duration-300 flex flex-col"
                  >
                    <div className={`bg-dark-light/20 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 border border-gray-800/50 ${colorScheme.border} shadow-lg ${colorScheme.shadow} hover:bg-dark-light/30 shiny-card`}>
                      <div className="card-content">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FaFolder className={`w-6 h-6 ${colorScheme.icon}`} />
                          </div>
                          <div className="flex items-center space-x-1">
                            {colorScheme.dots.map((dot, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${dot}`}></div>
                            ))}
                          </div>
                        </div>
                        
                        <h3 className={`text-lg font-semibold text-white ${colorScheme.text} transition-colors`}>
                          {subject.name}
                        </h3>
                        
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <MdPlayLesson className="w-4 h-4" />
                            <span>{subject.chapters_count} Chapters</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaYoutube className={`w-4 h-4 ${colorScheme.icon}`} />
                            <span>{subject.playlists_count} Playlists</span>
                          </div>
                        </div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorScheme.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    </div>
                  </Link>
                );
              })}

              {filteredSubjects.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No subjects found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
