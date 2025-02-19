'use client'

import { useState, useEffect } from 'react'
import { FaYoutube, FaCheck, FaTimes, FaEdit, FaTrash, FaGithub, FaLinkedin, FaInstagram, FaSignOutAlt, FaFileAlt, FaGoogleDrive, FaTelegram, FaLink, FaExclamationTriangle } from 'react-icons/fa'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Note {
  id: string
  title: string
  url: string
  created_at: string
  chapter: {
    id: string
    name: string
    subject: {
      id: string
      name: string
    }
  }
}

interface Playlist {
  id: string
  title: string
  url: string
  thumbnail_url: string
  created_at: string
  chapter: {
    id: string
    name: string
    subject: {
      id: string
      name: string
    }
  }
}

interface Developer {
  id: string
  name: string
  role: string
  image_url: string
  github_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  college_name: string | null
}

interface Subject {
  id: string
  name: string
  chapters?: Chapter[]
}

interface Chapter {
  id: string
  name: string
  subject_id: string
  subject?: Subject
}

export default function AdminDashboard() {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingNotes, setPendingNotes] = useState<Note[]>([])
  const [approvedNotes, setApprovedNotes] = useState<Note[]>([])
  const [pendingPlaylists, setPendingPlaylists] = useState<Playlist[]>([])
  const [approvedPlaylists, setApprovedPlaylists] = useState<Playlist[]>([])
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editedNoteTitle, setEditedNoteTitle] = useState('')
  const [editedNoteUrl, setEditedNoteUrl] = useState('')
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [editedPlaylistTitle, setEditedPlaylistTitle] = useState('')
  const [editedPlaylistUrl, setEditedPlaylistUrl] = useState('')
  const [activeTab, setActiveTab] = useState('pending_notes')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [addingSubject, setAddingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [addingChapter, setAddingChapter] = useState(false)
  const [newChapterName, setNewChapterName] = useState('')
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [showDeveloperModal, setShowDeveloperModal] = useState(false)
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null)
  const [newDeveloper, setNewDeveloper] = useState({
    name: '',
    role: '',
    image_url: '',
    github_url: '',
    linkedin_url: '',
    instagram_url: '',
    college_name: ''
  })
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const [showAddChapterModal, setShowAddChapterModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'reject';
    id: string;
    title: string;
  } | null>(null);
  const [showPlaylistConfirm, setShowPlaylistConfirm] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<any>(null);

  const router = useRouter()

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialLoading(true)
        await Promise.all([
          fetchPendingNotes(),
          fetchApprovedNotes(),
          fetchPendingPlaylists(),
          fetchApprovedPlaylists(),
          fetchSubjects(),
          fetchDevelopers()
        ])
      } finally {
        setIsInitialLoading(false)
      }
    }

    initializeData()
  }, [])

  useEffect(() => {
    // Subscribe to notes changes
    const notesSubscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes' 
        }, 
        (payload) => {
          console.log('Notes change received:', payload)
          fetchPendingNotes()
          fetchApprovedNotes()
        }
      )
      .subscribe()

    // Subscribe to playlists changes
    const playlistsSubscription = supabase
      .channel('playlists_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'playlists' 
        }, 
        (payload) => {
          console.log('Playlists change received:', payload)
          fetchPendingPlaylists()
          fetchApprovedPlaylists()
        }
      )
      .subscribe()

    // Subscribe to subjects changes
    const subjectsSubscription = supabase
      .channel('subjects_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'subjects' 
        }, 
        (payload) => {
          console.log('Subjects change received:', payload)
          fetchSubjects()
        }
      )
      .subscribe()

    // Subscribe to chapters changes
    const chaptersSubscription = supabase
      .channel('chapters_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chapters' 
        }, 
        (payload) => {
          console.log('Chapters change received:', payload)
          fetchChapters()
        }
      )
      .subscribe()

    // Subscribe to developers changes
    const developersSubscription = supabase
      .channel('developers_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'developers' 
        }, 
        (payload) => {
          console.log('Developers change received:', payload)
          fetchDevelopers()
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      notesSubscription.unsubscribe()
      playlistsSubscription.unsubscribe()
      subjectsSubscription.unsubscribe()
      chaptersSubscription.unsubscribe()
      developersSubscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (selectedSubject?.id) {
      fetchChapters()
    }
  }, [selectedSubject])

  const fetchPendingPlaylists = async () => {
    try {
      setIsActionLoading(true)
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          url,
          thumbnail_url,
          created_at,
          chapter:chapter_id (
            id,
            name,
            subject:subject_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedData = (data || []).map((playlist: any): Playlist => ({
        id: playlist.id,
        title: playlist.title,
        url: playlist.url,
        thumbnail_url: playlist.thumbnail_url,
        created_at: playlist.created_at,
        chapter: {
          id: playlist.chapter.id,
          name: playlist.chapter.name,
          subject: {
            id: playlist.chapter.subject.id,
            name: playlist.chapter.subject.name
          }
        }
      }))

      setPendingPlaylists(transformedData)
    } catch (error) {
      console.error('Error fetching pending playlists:', error)
      toast.error('Failed to fetch pending playlists')
    } finally {
      setIsActionLoading(false)
    }
  }

  const fetchApprovedPlaylists = async () => {
    try {
      setIsActionLoading(true)
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          url,
          thumbnail_url,
          created_at,
          chapter:chapter_id (
            id,
            name,
            subject:subject_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData = (data || []).map((playlist: any): Playlist => ({
        id: playlist.id,
        title: playlist.title,
        url: playlist.url,
        thumbnail_url: playlist.thumbnail_url,
        created_at: playlist.created_at,
        chapter: {
          id: playlist.chapter.id,
          name: playlist.chapter.name,
          subject: {
            id: playlist.chapter.subject.id,
            name: playlist.chapter.subject.name
          }
        }
      }))

      setApprovedPlaylists(transformedData)
    } catch (error) {
      console.error('Error fetching approved playlists:', error)
      toast.error('Failed to fetch approved playlists')
    } finally {
      setIsActionLoading(false)
    }
  }

  const fetchPendingNotes = async () => {
    try {
      setIsActionLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          url,
          created_at,
          chapter:chapter_id (
            id,
            name,
            subject:subject_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedData = (data || []).map((note: any): Note => ({
        id: note.id,
        title: note.title,
        url: note.url,
        created_at: note.created_at,
        chapter: {
          id: note.chapter.id,
          name: note.chapter.name,
          subject: {
            id: note.chapter.subject.id,
            name: note.chapter.subject.name
          }
        }
      }))

      setPendingNotes(transformedData)
    } catch (error) {
      console.error('Error fetching pending notes:', error)
      toast.error('Failed to fetch pending notes')
    } finally {
      setIsActionLoading(false)
    }
  }

  const fetchApprovedNotes = async () => {
    try {
      setIsActionLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          url,
          created_at,
          chapter:chapter_id (
            id,
            name,
            subject:subject_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData = (data || []).map((note: any): Note => ({
        id: note.id,
        title: note.title,
        url: note.url,
        created_at: note.created_at,
        chapter: {
          id: note.chapter.id,
          name: note.chapter.name,
          subject: {
            id: note.chapter.subject.id,
            name: note.chapter.subject.name
          }
        }
      }))

      setApprovedNotes(transformedData)
    } catch (error) {
      console.error('Error fetching approved notes:', error)
      toast.error('Failed to fetch approved notes')
    } finally {
      setIsActionLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (err) {
      console.error('Error fetching subjects:', err)
    }
  }

  const fetchChapters = async () => {
    if (!selectedSubject?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', selectedSubject.id)
        .order('name', { ascending: true })

      if (error) throw error

      setChapters(data || [])
    } catch (err) {
      console.error('Error fetching chapters:', err)
    }
  }

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setDevelopers(data || [])
    } catch (err) {
      console.error('Error fetching developers:', err)
    }
  }

  const handlePlaylistAction = async (playlistId: string, action: 'approve' | 'decline') => {
    if (action === 'decline') {
      if (!window.confirm('Are you sure you want to reject this playlist? It will be permanently deleted.')) {
        return
      }
    }

    try {
      setIsActionLoading(true)
      if (action === 'decline') {
        const { error } = await supabase
          .from('playlists')
          .delete()
          .eq('id', playlistId)

        if (error) throw error
        toast.success('Playlist rejected and deleted successfully')
      } else {
        const { error } = await supabase
          .from('playlists')
          .update({ status: 'approved' })
          .eq('id', playlistId)

        if (error) throw error
        toast.success('Playlist approved successfully')
      }
      
      await Promise.all([fetchPendingPlaylists(), fetchApprovedPlaylists()])
    } catch (error) {
      console.error(`Error ${action}ing playlist:`, error)
      toast.error(`Failed to ${action} playlist`)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleNoteAction = async (noteId: string, action: 'approve' | 'decline') => {
    try {
      setIsActionLoading(true)
      if (action === 'decline') {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId)

        if (error) throw error
        toast.success('Note rejected and deleted successfully')
      } else {
        const { error } = await supabase
          .from('notes')
          .update({ status: 'published' })
          .eq('id', noteId)

        if (error) throw error
        toast.success('Note approved successfully')
      }
      
      await Promise.all([fetchPendingNotes(), fetchApprovedNotes()])
    } catch (error) {
      console.error(`Error ${action}ing note:`, error)
      toast.error(`Failed to ${action} note`)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setEditedNoteTitle(note.title)
    setEditedNoteUrl(note.url)
  }

  const handleCancelNoteEdit = () => {
    setEditingNote(null)
    setEditedNoteTitle('')
    setEditedNoteUrl('')
  }

  const handleSaveNoteEdit = async () => {
    if (!editingNote) return

    try {
      setIsActionLoading(true)
      const { error } = await supabase
        .from('notes')
        .update({
          title: editedNoteTitle,
          url: editedNoteUrl
        })
        .eq('id', editingNote.id)

      if (error) throw error

      toast.success('Note updated successfully')
      fetchApprovedNotes()
      handleCancelNoteEdit()
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsActionLoading(true)
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      toast.success('Note deleted successfully')
      fetchApprovedNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
    setEditedPlaylistTitle(playlist.title)
    setEditedPlaylistUrl(playlist.url)
  }

  const handleCancelPlaylistEdit = () => {
    setEditingPlaylist(null)
    setEditedPlaylistTitle('')
    setEditedPlaylistUrl('')
  }

  const handleSavePlaylistEdit = async () => {
    if (!editingPlaylist) return

    try {
      setIsActionLoading(true)
      const { error } = await supabase
        .from('playlists')
        .update({
          title: editedPlaylistTitle,
          url: editedPlaylistUrl
        })
        .eq('id', editingPlaylist.id)

      if (error) throw error

      toast.success('Playlist updated successfully')
      fetchApprovedPlaylists()
      handleCancelPlaylistEdit()
    } catch (error) {
      console.error('Error updating playlist:', error)
      toast.error('Failed to update playlist')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeletePlaylist = async (playlist: any) => {
    showPlaylistDeleteConfirm(playlist);
  };

  const handlePlaylistDeleteConfirm = async () => {
    if (!playlistToDelete) return;
    
    try {
      setIsActionLoading(true);
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistToDelete.id);

      if (error) throw error;

      toast.success('Playlist deleted successfully');
      fetchApprovedPlaylists();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsActionLoading(false);
      setShowPlaylistConfirm(false);
      setPlaylistToDelete(null);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;

    try {
      const { data: newSubject, error } = await supabase
        .from('subjects')
        .insert([{ name: newSubjectName }])
        .select()
        .single();

      if (error) throw error;

      // Update subjects list
      setSubjects([...subjects, newSubject]);
      
      // Reset form
      setNewSubjectName('');
      setShowAddSubjectModal(false);
      
      toast.success('Subject added successfully!');
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error('Failed to add subject');
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterName.trim() || !selectedSubject) return;

    try {
      const { data: newChapter, error } = await supabase
        .from('chapters')
        .insert([{ 
          name: newChapterName,
          subject_id: selectedSubject?.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Update chapters list
      setChapters([...chapters, newChapter]);
      
      // Reset form
      setNewChapterName('');
      setShowAddChapterModal(false);
      
      toast.success('Chapter added successfully!');
    } catch (error) {
      console.error('Error adding chapter:', error);
      toast.error('Failed to add chapter');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId)

      if (error) throw error

      fetchChapters()
    } catch (err) {
      console.error('Error deleting chapter:', err)
    }
  }

  const handleDeleteSubject = async (subjectId: string | undefined) => {
    if (!subjectId) return;
    
    if (!confirm('Are you sure you want to delete this subject and all its chapters? This action cannot be undone.')) {
      return
    }

    try {
      // First delete all chapters
      const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .eq('subject_id', subjectId)

      if (chaptersError) throw chaptersError

      // Then delete the subject
      const { error: subjectError } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)

      if (subjectError) throw subjectError

      setSelectedSubject(null)
      fetchSubjects()
      toast.success('Subject deleted successfully!')
    } catch (err) {
      console.error('Error deleting subject:', err)
      toast.error('Failed to delete subject')
    }
  }

  const handleAddDeveloper = async () => {
    try {
      const { error } = await supabase
        .from('developers')
        .insert([newDeveloper])

      if (error) throw error

      setShowDeveloperModal(false)
      setNewDeveloper({
        name: '',
        role: '',
        image_url: '',
        github_url: '',
        linkedin_url: '',
        instagram_url: '',
        college_name: ''
      })
      fetchDevelopers()
    } catch (err) {
      console.error('Error adding developer:', err)
    }
  }

  const handleUpdateDeveloper = async () => {
    if (!editingDeveloper) return

    try {
      const { error } = await supabase
        .from('developers')
        .update({
          name: editingDeveloper.name,
          role: editingDeveloper.role,
          image_url: editingDeveloper.image_url,
          github_url: editingDeveloper.github_url,
          linkedin_url: editingDeveloper.linkedin_url,
          instagram_url: editingDeveloper.instagram_url,
          college_name: editingDeveloper.college_name
        })
        .eq('id', editingDeveloper.id)

      if (error) throw error

      setShowDeveloperModal(false)
      setEditingDeveloper(null)
      fetchDevelopers()
    } catch (err) {
      console.error('Error updating developer:', err)
    }
  }

  const handleDeleteDeveloper = async (id: string) => {
    if (!confirm('Are you sure you want to delete this developer?')) return

    try {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchDevelopers()
    } catch (err) {
      console.error('Error deleting developer:', err)
    }
  }

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    
    // If no subject is selected, clear chapters and selectedSubject
    if (!subjectId) {
      setChapters([]);
      setSelectedSubject(null);
      return;
    }

    // Find the selected subject from subjects array
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      // Update chapters for the selected subject
      setChapters(subject.chapters || []);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      
      // Show success message
      toast.success('Logged out successfully!');
      
      // Redirect to admin login page
      router.replace('/admin');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const getNoteIcon = (url: string) => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('drive.google')) {
      return <FaGoogleDrive className="text-2xl text-blue-400" />;
    } else if (urlLower.includes('telegram')) {
      return <FaTelegram className="text-2xl text-sky-400" />;
    } else if (urlLower.includes('github')) {
      return <FaGithub className="text-2xl text-purple-400" />;
    } else {
      return <FaFileAlt className="text-2xl text-emerald-400" />;
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'delete') {
      handleDeleteNote(confirmAction.id);
    } else if (confirmAction.type === 'reject') {
      handleNoteAction(confirmAction.id, 'decline');
    }
    
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const showDeleteConfirm = (note: any) => {
    setConfirmAction({
      type: 'delete',
      id: note.id,
      title: note.title
    });
    setShowConfirmDialog(true);
  };

  const showRejectConfirm = (note: any) => {
    setConfirmAction({
      type: 'reject',
      id: note.id,
      title: note.title
    });
    setShowConfirmDialog(true);
  };

  const showPlaylistDeleteConfirm = (playlist: any) => {
    setPlaylistToDelete(playlist);
    setShowPlaylistConfirm(true);
  };

  return (
    <div>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8 p-6 bg-dark-light/50 backdrop-blur-md rounded-lg border border-gray-700/50"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-white relative"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2)'
          }}
        >
          TeamGTC Dashboard
        </motion.h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="overflow-x-auto whitespace-nowrap pb-2 border-b border-gray-700 hide-scrollbar">
        <div className="inline-flex space-x-4 px-4">
          <button
            onClick={() => setActiveTab('pending_notes')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'pending_notes'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Pending Notes
          </button>
          <button
            onClick={() => setActiveTab('approved_notes')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'approved_notes'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Approved Notes
          </button>
          <button
            onClick={() => setActiveTab('pending_playlists')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'pending_playlists'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Pending Playlists
          </button>
          <button
            onClick={() => setActiveTab('approved_playlists')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'approved_playlists'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Approved Playlists
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Manage Subjects
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'developer'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Manage Developers
          </button>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-primary">Loading...</div>
        </div>
      ) : (
        <>
          {/* Pending Notes Tab */}
          {!isInitialLoading && activeTab === 'pending_notes' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-6">Pending Notes</h2>
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {pendingNotes.length > 0 ? (
                  pendingNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      className="bg-dark/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Note Icon */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-shrink-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 rounded-lg"
                        >
                          <FaFileAlt className="text-4xl text-indigo-400" />
                        </motion.div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {editingNote?.id === note.id ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={editedNoteTitle}
                                    onChange={(e) => setEditedNoteTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                    placeholder="Note Title"
                                  />
                                  <input
                                    type="url"
                                    value={editedNoteUrl}
                                    onChange={(e) => setEditedNoteUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                    placeholder="Note URL"
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={handleSaveNoteEdit}
                                      disabled={isActionLoading}
                                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-1"
                                    >
                                      <FaCheck className="text-sm" />
                                      <span>Save</span>
                                    </button>
                                    <button
                                      onClick={handleCancelNoteEdit}
                                      disabled={isActionLoading}
                                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-1"
                                    >
                                      <FaTimes className="text-sm" />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-lg font-medium">{note.title}</h3>
                                  <p className="text-gray-400">
                                    Subject: {note.chapter?.subject?.name} | Chapter: {note.chapter?.name}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <a 
                                      href={note.url} 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(note.url, '_blank');
                                      }}
                                      className="text-primary hover:text-primary/80 text-sm flex items-center space-x-2 cursor-pointer"
                                    >
                                      <span>View Note</span>
                                    </a>
                                    <span className="text-gray-500 text-sm">
                                      Submitted: {new Date(note.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {!editingNote && (
                                <button
                                  onClick={() => handleEditNote(note)}
                                  disabled={isActionLoading}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => showRejectConfirm(note)}
                                disabled={isActionLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleNoteAction(note.id, 'approve')}
                                disabled={isActionLoading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center p-8 bg-dark-light/30 rounded-lg border border-gray-700/50"
                  >
                    <p className="text-xl text-gray-400 mb-2">No Pending Notes</p>
                    <p className="text-sm text-gray-500">All notes have been reviewed!</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Approved Notes Tab */}
          {!isInitialLoading && activeTab === 'approved_notes' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-6">Approved Notes</h2>
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {approvedNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="bg-dark/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Note Icon */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-shrink-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 rounded-lg"
                      >
                        <FaFileAlt className="text-4xl text-indigo-400" />
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {editingNote?.id === note.id ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editedNoteTitle}
                                  onChange={(e) => setEditedNoteTitle(e.target.value)}
                                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                  placeholder="Note Title"
                                />
                                <input
                                  type="url"
                                  value={editedNoteUrl}
                                  onChange={(e) => setEditedNoteUrl(e.target.value)}
                                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                  placeholder="Note URL"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleSaveNoteEdit}
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-1"
                                  >
                                    <FaCheck className="text-sm" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={handleCancelNoteEdit}
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-1"
                                  >
                                    <FaTimes className="text-sm" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-lg font-medium">{note.title}</h3>
                                <p className="text-gray-400">
                                  Subject: {note.chapter?.subject?.name} | Chapter: {note.chapter?.name}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <a 
                                    href={note.url} 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(note.url, '_blank');
                                    }}
                                    className="text-primary hover:text-primary/80 text-sm flex items-center space-x-2 cursor-pointer"
                                  >
                                    <span>View Note</span>
                                  </a>
                                  <span className="text-gray-500 text-sm">
                                    Submitted: {new Date(note.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {!editingNote && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditNote(note)}
                                disabled={isActionLoading}
                                className="p-2 text-blue-500 hover:text-blue-400 transition-colors rounded-lg"
                                title="Edit Note"
                              >
                                <FaEdit className="text-xl" />
                              </button>
                              <button
                                onClick={() => showDeleteConfirm(note)}
                                disabled={isActionLoading}
                                className="p-2 text-red-500 hover:text-red-400 transition-colors rounded-lg"
                                title="Delete Note"
                              >
                                <FaTrash className="text-xl" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Pending Playlists Tab */}
          {!isInitialLoading && activeTab === 'pending_playlists' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-6">Pending Playlists</h2>
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {pendingPlaylists.length > 0 ? (
                  pendingPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      className="bg-dark/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Thumbnail */}
                        {playlist.thumbnail_url && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-shrink-0"
                          >
                            <Image
                              src={playlist.thumbnail_url}
                              alt={playlist.title}
                              width={120}
                              height={68}
                              className="rounded-lg object-cover"
                            />
                          </motion.div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {editingPlaylist?.id === playlist.id ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={editedPlaylistTitle}
                                    onChange={(e) => setEditedPlaylistTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                    placeholder="Playlist Title"
                                  />
                                  <input
                                    type="url"
                                    value={editedPlaylistUrl}
                                    onChange={(e) => setEditedPlaylistUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                    placeholder="Playlist URL"
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={handleSavePlaylistEdit}
                                      disabled={isActionLoading}
                                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-1"
                                    >
                                      <FaCheck className="text-sm" />
                                      <span>Save</span>
                                    </button>
                                    <button
                                      onClick={handleCancelPlaylistEdit}
                                      disabled={isActionLoading}
                                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-1"
                                    >
                                      <FaTimes className="text-sm" />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-lg font-medium">{playlist.title}</h3>
                                  <p className="text-gray-400">
                                    Subject: {playlist.chapter?.subject?.name} | Chapter: {playlist.chapter?.name}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <a 
                                      href={playlist.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-primary hover:text-primary/80 text-sm flex items-center space-x-1"
                                    >
                                      <FaYoutube className="text-lg" />
                                      <span>View Playlist</span>
                                    </a>
                                    <span className="text-gray-500 text-sm">
                                      Submitted: {new Date(playlist.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {!editingPlaylist && (
                                <button
                                  onClick={() => handleEditPlaylist(playlist)}
                                  disabled={isActionLoading}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handlePlaylistAction(playlist.id, 'approve')}
                                disabled={isActionLoading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeletePlaylist(playlist)}
                                disabled={isActionLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center p-8 bg-dark-light/30 rounded-lg border border-gray-700/50"
                  >
                    <p className="text-xl text-gray-400 mb-2">No Pending Playlists</p>
                    <p className="text-sm text-gray-500">All playlists have been reviewed!</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Approved Playlists Tab */}
          {!isInitialLoading && activeTab === 'approved_playlists' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-6">Approved Playlists</h2>
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {approvedPlaylists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="bg-dark/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail */}
                      {playlist.thumbnail_url && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-shrink-0"
                        >
                          <Image
                            src={playlist.thumbnail_url}
                            alt={playlist.title}
                            width={120}
                            height={68}
                            className="rounded-lg object-cover"
                          />
                        </motion.div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {editingPlaylist?.id === playlist.id ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editedPlaylistTitle}
                                  onChange={(e) => setEditedPlaylistTitle(e.target.value)}
                                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                  placeholder="Playlist Title"
                                />
                                <input
                                  type="url"
                                  value={editedPlaylistUrl}
                                  onChange={(e) => setEditedPlaylistUrl(e.target.value)}
                                  className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-lg text-white"
                                  placeholder="Playlist URL"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleSavePlaylistEdit}
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-1"
                                  >
                                    <FaCheck className="text-sm" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={handleCancelPlaylistEdit}
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-1"
                                  >
                                    <FaTimes className="text-sm" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-lg font-medium">{playlist.title}</h3>
                                <p className="text-gray-400">
                                  Subject: {playlist.chapter?.subject?.name} | Chapter: {playlist.chapter?.name}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <a 
                                    href={playlist.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-primary hover:text-primary/80 text-sm flex items-center space-x-1"
                                  >
                                    <FaYoutube className="text-lg" />
                                    <span>View Playlist</span>
                                  </a>
                                  <span className="text-gray-500 text-sm">
                                    Submitted: {new Date(playlist.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {!editingPlaylist && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditPlaylist(playlist)}
                                disabled={isActionLoading}
                                className="p-2 text-blue-500 hover:text-blue-400 transition-colors rounded-lg"
                                title="Edit Playlist"
                              >
                                <FaEdit className="text-xl" />
                              </button>
                              <button
                                onClick={() => handleDeletePlaylist(playlist)}
                                disabled={isActionLoading}
                                className="p-2 text-red-500 hover:text-red-400 transition-colors rounded-lg"
                                title="Delete Playlist"
                              >
                                <FaTrash className="text-xl" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Manage Subjects</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddSubjectModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add Subject
                </motion.button>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Subject Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">Select Subject</label>
                  <motion.select
                    value={selectedSubject?.id || ''}
                    onChange={handleSubjectChange}
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "tween", duration: 0.2 }}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Chapters Section */}
                {selectedSubject && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Chapters</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddChapterModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Add Chapter
                      </motion.button>
                    </div>

                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {chapters.map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between bg-dark/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
                        >
                          <span>{chapter.name}</span>
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <FaTrash />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Delete Subject Button */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="pt-6 mt-6 border-t border-gray-700"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#dc2626' }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "tween", duration: 0.2 }}
                        onClick={() => handleDeleteSubject(selectedSubject?.id)}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                        <span>Delete Subject with All Chapters</span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

              {/* Add Subject Modal */}
              <AnimatePresence>
                {showAddSubjectModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className="bg-dark-light/80 backdrop-blur-md rounded-lg p-6 w-full max-w-md border border-gray-700/50 shadow-xl"
                    >
                      <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Subject</h3>
                      <motion.input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="Subject Name"
                        className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 mb-4"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", damping: 15 }}
                      />
                      <div className="flex justify-end space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAddSubjectModal(false)}
                          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAddSubject}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Add Subject
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Chapter Modal */}
              <AnimatePresence>
                {showAddChapterModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className="bg-dark-light/80 backdrop-blur-md rounded-lg p-6 w-full max-w-md border border-gray-700/50 shadow-xl"
                    >
                      <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Chapter</h3>
                      <motion.input
                        type="text"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        placeholder="Chapter Name"
                        className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 mb-4"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", damping: 15 }}
                      />
                      <div className="flex justify-end space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAddChapterModal(false)}
                          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAddChapter}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Add Chapter
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Developers Tab */}
          {!isInitialLoading && activeTab === 'developer' && (
            <div className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Manage Developers</h2>
                <button
                  onClick={() => setShowDeveloperModal(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg"
                >
                  Add Developer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {developers.map((dev) => (
                  <div key={dev.id} className="bg-dark-light/50 backdrop-blur-md rounded-lg p-6">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={dev.image_url}
                        alt={dev.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">{dev.name}</h3>
                    <p className="text-gray-400 text-center mb-4">{dev.role}</p>
                    <div className="flex justify-center space-x-4 mb-4">
                      {dev.github_url && <FaGithub className="text-xl text-gray-400" />}
                      {dev.linkedin_url && <FaLinkedin className="text-xl text-gray-400" />}
                      {dev.instagram_url && <FaInstagram className="text-xl text-gray-400" />}
                    </div>
                    {dev.college_name && (
                      <p className="text-gray-400 text-center mb-4 font-mono text-sm border-t border-gray-700/50 pt-4">
                        {dev.college_name}
                      </p>
                    )}
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setEditingDeveloper(dev)
                          setShowDeveloperModal(true)
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDeveloper(dev.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {/* Developer Modal */}
      <AnimatePresence>
        {showDeveloperModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-dark-light/80 backdrop-blur-md rounded-lg p-6 w-full max-w-md border border-gray-700/50 shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {editingDeveloper ? 'Edit Developer' : 'Add Developer'}
              </h3>
              <motion.div 
                className="space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.name || newDeveloper.name}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, name: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Role</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.role || newDeveloper.role}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, role: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, role: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Image URL</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.image_url || newDeveloper.image_url}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, image_url: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, image_url: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">GitHub URL</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.github_url || newDeveloper.github_url}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, github_url: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, github_url: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">LinkedIn URL</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.linkedin_url || newDeveloper.linkedin_url}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, linkedin_url: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, linkedin_url: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Instagram URL</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.instagram_url || newDeveloper.instagram_url}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, instagram_url: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, instagram_url: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">College Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 15 }}
                    type="text"
                    value={editingDeveloper?.college_name || newDeveloper.college_name}
                    onChange={(e) =>
                      editingDeveloper
                        ? setEditingDeveloper({ ...editingDeveloper, college_name: e.target.value })
                        : setNewDeveloper({ ...newDeveloper, college_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-dark/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono"
                  />
                </div>
              </motion.div>
              <motion.div 
                className="flex justify-end space-x-4 mt-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDeveloperModal(false)
                    setEditingDeveloper(null)
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editingDeveloper ? handleUpdateDeveloper : handleAddDeveloper}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingDeveloper ? 'Update' : 'Add'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark/90 p-6 rounded-lg border border-gray-700/50 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                {confirmAction?.type === 'delete' ? 'Delete Note' : 'Reject Note'}
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to {confirmAction?.type === 'delete' ? 'delete' : 'reject'} "{confirmAction?.title}"? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {confirmAction?.type === 'delete' ? 'Delete' : 'Reject'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {showPlaylistConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark/90 p-6 rounded-lg border border-gray-700/50 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">Delete Playlist</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{playlistToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => {
                    setShowPlaylistConfirm(false);
                    setPlaylistToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaylistDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}