'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function NotesUploadForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      fetchChapters(subjectId);
    } else {
      setChapters([]);
      setChapterId('');
    }
  }, [subjectId]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      toast.error('Failed to load subjects');
    }
  };

  const fetchChapters = async (selectedSubjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', selectedSubjectId)
        .order('name');
      
      if (error) throw error;
      setChapters(data || []);
    } catch (err) {
      console.error('Error fetching chapters:', err);
      toast.error('Failed to load chapters');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !url || !chapterId) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notes')
        .insert([
          {
            title,
            url,
            chapter_id: chapterId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('Notes submitted successfully!');
      setTitle('');
      setUrl('');
      setSubjectId('');
      setChapterId('');
    } catch (err) {
      console.error('Error submitting notes:', err);
      toast.error('Failed to submit notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
          placeholder="Enter note title"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-200 mb-2">
          URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
          placeholder="Enter note URL"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-200 mb-2">
          Subject
        </label>
        <select
          id="subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="chapter" className="block text-sm font-medium text-gray-200 mb-2">
          Chapter
        </label>
        <select
          id="chapter"
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
          disabled={!subjectId}
        >
          <option value="">Select Chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          'Submit Notes'
        )}
      </button>
    </form>
  );
}
