import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeEntriesApi, categoriesApi } from '../api';
import type { TimeEntry, Category } from '../types';
import Modal from '../components/Modal';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Entries() {
  usePageTitle('Entries');
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry>({
    Date: new Date().toISOString().split('T')[0],
    Hours: 0,
    Description: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Category>({ Name: '', Color: '#10b981' });

  useEffect(() => {
    loadCategories();
    loadEntries();
  }, [selectedMonth, selectedYear]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getActive();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const response = await timeEntriesApi.getByMonth(selectedYear, selectedMonth);
      setEntries(response.data);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const openAddModal = () => {
    navigate('/task/new');
  };

  const openEditModal = () => {
    if (selectedEntry && selectedEntry.Id) {
      navigate(`/task/${selectedEntry.Id}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEntry({
      Date: new Date().toISOString().split('T')[0],
      Hours: 0,
      Description: '',
    });
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentEntry.Id) {
        await timeEntriesApi.update(currentEntry.Id, currentEntry);
      } else {
        await timeEntriesApi.create(currentEntry);
      }
      await loadEntries();
      closeModal();
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const deleteEntry = async () => {
    if (selectedEntry && selectedEntry.Id) {
      try {
        await timeEntriesApi.delete(selectedEntry.Id);
        await loadEntries();
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  const saveQuickCategory = async () => {
    if (!newCategory.Name.trim()) return;

    try {
      const response = await categoriesApi.create(newCategory);
      await loadCategories();
      setCurrentEntry({ ...currentEntry, CategoryId: response.data.Id });
      setShowQuickAddModal(false);
      setNewCategory({ Name: '', Color: '#10b981' });
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.Hours, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Time Entries</h1>
          <p className="text-gray-400">Manage your daily and monthly time logs with ease.</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-gray-900 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-gray-900 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 5 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <span>+</span> Add Task
            </button>
            {selectedEntry && (
              <>
                <button
                  onClick={openEditModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <span>✎</span> Edit Task
                </button>
                <button
                  onClick={deleteEntry}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <span>🗑</span> Delete Entry
                </button>
              </>
            )}
          </div>
        </div>

        {/* Entries Table */}
        {entries.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400">No entries found for this month.</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Task Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {entries.map((entry) => (
                    <tr
                      key={entry.Id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-gray-800 cursor-pointer ${
                        selectedEntry?.Id === entry.Id ? 'bg-gray-800' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{entry.Date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400">
                        {entry.Hours.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.Category ? (
                          <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.Category.Color }}
                            ></span>
                            {entry.Category.Name}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{entry.Description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-4 text-right text-gray-400">
              <span className="font-semibold">Total Hours: </span>
              <span className="text-green-400 text-lg">{totalHours.toFixed(1)}</span>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={isEditMode ? 'Edit Entry' : 'Add Entry'}>
        <form onSubmit={saveEntry}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Date:</label>
            <input
              type="date"
              value={currentEntry.Date}
              onChange={(e) => setCurrentEntry({ ...currentEntry, Date: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Hours:</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="24"
              value={currentEntry.Hours}
              onChange={(e) => setCurrentEntry({ ...currentEntry, Hours: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Category:</label>
            <div className="flex gap-2">
              <select
                value={currentEntry.CategoryId || ''}
                onChange={(e) =>
                  setCurrentEntry({
                    ...currentEntry,
                    CategoryId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-3 py-2 rounded flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">Task Description:</label>
            <textarea
              rows={4}
              value={currentEntry.Description}
              onChange={(e) => setCurrentEntry({ ...currentEntry, Description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Category Modal */}
      <Modal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        title="Quick Add Category"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Name</label>
            <input
              type="text"
              value={newCategory.Name}
              onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={newCategory.Color}
                onChange={(e) => setNewCategory({ ...newCategory, Color: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 h-10 w-16"
              />
              <input
                type="text"
                value={newCategory.Color}
                onChange={(e) => setNewCategory({ ...newCategory, Color: e.target.value })}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                placeholder="#10b981"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={saveQuickCategory}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowQuickAddModal(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
