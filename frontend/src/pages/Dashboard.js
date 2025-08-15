import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Brain, 
  Calendar, 
  Heart, 
  Trash2, 
  Edit3, 
  Plus,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newThought, setNewThought] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [filterMood, setFilterMood] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'stressed', label: 'Stressed', emoji: '😤' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' }
  ];

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/thoughts');
      setThoughts(response.data.thoughts);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      toast.error('Failed to load thoughts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitThought = async (e) => {
    e.preventDefault();
    if (!newThought.trim()) {
      toast.error('Please enter your thought');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/thoughts', {
        content: newThought,
        mood: selectedMood
      });

      setThoughts(prev => [response.data.thought, ...prev]);
      setNewThought('');
      setSelectedMood('neutral');
      setShowForm(false);
      toast.success('Thought shared successfully!');
    } catch (error) {
      console.error('Error submitting thought:', error);
      toast.error('Failed to share thought');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThought = async (thoughtId) => {
    if (!window.confirm('Are you sure you want to delete this thought?')) return;

    try {
      await axios.delete(`/api/thoughts/${thoughtId}`);
      setThoughts(prev => prev.filter(thought => thought._id !== thoughtId));
      toast.success('Thought deleted successfully');
    } catch (error) {
      console.error('Error deleting thought:', error);
      toast.error('Failed to delete thought');
    }
  };

  const filteredThoughts = thoughts.filter(thought => {
    const matchesMood = filterMood === 'all' || thought.mood === filterMood;
    const matchesSearch = thought.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMood && matchesSearch;
  });

  const ThoughtCard = ({ thought }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card p-6 thought-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium mood-${thought.mood}`}>
            {moods.find(m => m.value === thought.mood)?.emoji} {moods.find(m => m.value === thought.mood)?.label}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(thought.createdAt), 'MMM dd, yyyy - HH:mm')}
          </div>
        </div>
        <button
          onClick={() => handleDeleteThought(thought._id)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{thought.content}</p>
      </div>

      {thought.aiSuggestion && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 border-l-4 border-primary-500">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">AI Suggestion</h4>
              <p className="text-gray-700 leading-relaxed">{thought.aiSuggestion}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Share your thoughts and get AI-powered mental health suggestions
          </p>
        </motion.div>

        {/* New Thought Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center space-x-2 py-4 text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Share a new thought</span>
            </button>
          ) : (
            <form onSubmit={handleSubmitThought} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling today?
                </label>
                <textarea
                  value={newThought}
                  onChange={(e) => setNewThought(e.target.value)}
                  placeholder="Share your thoughts, feelings, or experiences..."
                  className="input-field resize-none h-32"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    {newThought.length}/2000 characters
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Mood
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedMood === mood.value
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-lg mb-1">{mood.emoji}</div>
                      <div className="text-xs">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newThought.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Share Thought</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search thoughts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="input-field"
            >
              <option value="all">All Moods</option>
              {moods.map((mood) => (
                <option key={mood.value} value={mood.value}>
                  {mood.emoji} {mood.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchThoughts}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </motion.div>

        {/* Thoughts List */}
        <div className="space-y-6">
          {loading ? (
            <LoadingSpinner text="Loading your thoughts..." />
          ) : filteredThoughts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {thoughts.length === 0 ? 'No thoughts yet' : 'No thoughts match your filters'}
              </h3>
              <p className="text-gray-500">
                {thoughts.length === 0 
                  ? 'Share your first thought to get started!' 
                  : 'Try adjusting your search or filters'
                }
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredThoughts.map((thought) => (
                <ThoughtCard key={thought._id} thought={thought} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


