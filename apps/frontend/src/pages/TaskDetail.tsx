import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { timeEntriesApi, categoriesApi } from '../api';
import type { TimeEntry, Category } from '../types';
import QuickAddCategoryModal from '../components/QuickAddCategoryModal';
import { usePageTitle } from '../hooks/usePageTitle';

export default function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  usePageTitle(isEditMode ? 'Edit Task' : 'New Task');

  const [entry, setEntry] = useState<TimeEntry>({
    Date: new Date().toISOString().split('T')[0],
    Hours: 0,
    Description: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditMode && id) {
      loadEntry(Number(id));
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getActive();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadEntry = async (entryId: number) => {
    try {
      setIsLoading(true);
      // Since there's no single entry endpoint, we'll need to fetch and find it
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const response = await timeEntriesApi.getByMonth(year, month);
      const foundEntry = response.data.find((e: TimeEntry) => e.Id === entryId);

      if (foundEntry) {
        setEntry(foundEntry);
      } else {
        console.error('Entry not found');
        navigate('/entries');
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
      navigate('/entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entry.Description.trim()) {
      alert('Please add a task description');
      return;
    }

    try {
      setIsSaving(true);
      if (isEditMode && entry.Id) {
        await timeEntriesApi.update(entry.Id, entry);
      } else {
        await timeEntriesApi.create(entry);
      }
      navigate('/entries');
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/entries');
  };

  const saveQuickCategory = async (category: Category) => {
    try {
      const response = await categoriesApi.create(category);
      await loadCategories();
      setEntry({ ...entry, CategoryId: response.data.Id });
      setShowQuickAddModal(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  // Keyboard shortcuts for formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = entry.Description.substring(start, end);

      let newText = entry.Description;
      let cursorOffset = 0;

      switch (e.key) {
        case 'b': // Bold
          e.preventDefault();
          newText = entry.Description.substring(0, start) + `**${selectedText}**` + entry.Description.substring(end);
          cursorOffset = 2;
          break;
        case 'i': // Italic
          e.preventDefault();
          newText = entry.Description.substring(0, start) + `*${selectedText}*` + entry.Description.substring(end);
          cursorOffset = 1;
          break;
      }

      if (newText !== entry.Description) {
        setEntry({ ...entry, Description: newText });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = end + cursorOffset * 2;
        }, 0);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Entries
          </button>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Task' : 'New Task'}</h1>
          <p className="text-gray-400 mt-2">
            {isEditMode ? 'Update your task details' : 'Add a new time entry with detailed description'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Date and Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={entry.Date}
                onChange={(e) => setEntry({ ...entry, Date: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hours</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="24"
                value={entry.Hours}
                onChange={(e) => setEntry({ ...entry, Hours: Number(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <div className="flex gap-2">
              <select
                value={entry.CategoryId || ''}
                onChange={(e) =>
                  setEntry({
                    ...entry,
                    CategoryId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- No Category --</option>
                {categories.map((category) => (
                  <option key={category.Id} value={category.Id}>
                    {category.Name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">Task Description</label>
              <div className="text-xs text-gray-500">
                Supports markdown: **bold**, *italic*, - lists
              </div>
            </div>
            <textarea
              rows={15}
              value={entry.Description}
              onChange={(e) => setEntry({ ...entry, Description: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              placeholder="Describe what you worked on...&#10;&#10;You can use:&#10;- Bullet points&#10;- **Bold text** (Ctrl+B)&#10;- *Italic text* (Ctrl+I)&#10;- ### Headers"
              required
            />
            <div className="mt-2 text-xs text-gray-500">
              Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isSaving ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Category Modal */}
      <QuickAddCategoryModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onCategoryAdded={saveQuickCategory}
      />
    </div>
  );
}
