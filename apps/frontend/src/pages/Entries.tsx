import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeEntriesApi, categoriesApi } from '../api';
import type { TimeEntry, Category } from '../types';
import Modal from '../components/Modal';
import QuickAddCategoryModal from '../components/QuickAddCategoryModal';
import { usePageTitle } from '../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDateDisplay = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Helper function to get weeks in a month
const getWeeksInMonth = (year: number, month: number): { label: string; start: number; end: number }[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: { label: string; start: number; end: number }[] = [];

  let weekNumber = 1;
  for (let start = 1; start <= daysInMonth; start += 7) {
    const end = Math.min(start + 6, daysInMonth);
    weeks.push({
      label: `Week ${weekNumber} (${start}-${end})`,
      start,
      end,
    });
    weekNumber++;
  }

  return weeks;
};

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

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
      if (currentEntry.Id) {
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

  const saveQuickCategory = async (category: Category) => {
    try {
      const response = await categoriesApi.create(category);
      await loadCategories();
      setCurrentEntry({ ...currentEntry, CategoryId: response.data.Id });
      setShowQuickAddModal(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleExport = async () => {
    try {
      // Fetch all entries and filter by date range
      const allEntries: TimeEntry[] = [];

      // Parse date range
      const startDate = new Date(exportDateRange.startDate);
      const endDate = new Date(exportDateRange.endDate);

      // Get year and month range
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endMonth = endDate.getMonth() + 1;

      // Fetch data for each month in the range
      for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 1;
        const monthEnd = year === endYear ? endMonth : 12;

        for (let month = monthStart; month <= monthEnd; month++) {
          const response = await timeEntriesApi.getByMonth(year, month);
          allEntries.push(...response.data);
        }
      }

      // Filter entries by exact date range
      const filteredEntries = allEntries.filter((entry) => {
        const entryDate = new Date(entry.Date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      if (filteredEntries.length === 0) {
        alert('No entries found in the selected date range.');
        return;
      }

      // Sort by date
      filteredEntries.sort((a, b) => a.Date.localeCompare(b.Date));

      // Prepare data for Excel
      const excelData = filteredEntries.map((entry) => ({
        Date: formatDateDisplay(entry.Date),
        Hours: entry.Hours,
        Category: entry.Category?.Name || '-',
        Description: entry.Description.replace(/[*_#`\n]/g, ' ').trim(), // Remove markdown formatting
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Entries');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 }, // Date
        { wch: 8 },  // Hours
        { wch: 20 }, // Category
        { wch: 60 }, // Description
      ];

      // Generate filename
      const filename = `TimeEntries_${exportDateRange.startDate}_to_${exportDateRange.endDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export entries:', error);
      alert('Failed to export entries. Please try again.');
    }
  };

  // Filter entries by selected week
  const filteredEntries = entries.filter((entry) => {
    if (selectedWeek === 'all') return true;

    const dayOfMonth = parseInt(entry.Date.split('-')[2], 10);
    const [start, end] = selectedWeek.split('-').map(Number);
    return dayOfMonth >= start && dayOfMonth <= end;
  });

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.Hours, 0);
  const weeks = getWeeksInMonth(selectedYear, selectedMonth);

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
          <div className="flex gap-4 flex-wrap">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setSelectedWeek('all');
                }}
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
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedWeek('all');
                }}
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

            {/* Week Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Week:</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Weeks</option>
                {weeks.map((week) => (
                  <option key={week.label} value={`${week.start}-${week.end}`}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <span>+</span> Add Task
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export to Excel
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
        {filteredEntries.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              {entries.length === 0
                ? 'No entries found for this month.'
                : 'No entries found for this week.'}
            </p>
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
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry.Id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-gray-800 cursor-pointer ${
                        selectedEntry?.Id === entry.Id ? 'bg-gray-800' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateDisplay(entry.Date)}</td>
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
                      <td className="px-6 py-4 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{entry.Description}</ReactMarkdown>
                      </td>
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
      <Modal isOpen={showModal} onClose={closeModal} title={currentEntry.Id ? 'Edit Entry' : 'Add Entry'}>
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
      <QuickAddCategoryModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onCategoryAdded={saveQuickCategory}
      />

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export to Excel"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Select a date range to export your time entries to an Excel file.
          </p>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Start Date</label>
            <input
              type="date"
              value={exportDateRange.startDate}
              onChange={(e) =>
                setExportDateRange({ ...exportDateRange, startDate: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">End Date</label>
            <input
              type="date"
              value={exportDateRange.endDate}
              onChange={(e) =>
                setExportDateRange({ ...exportDateRange, endDate: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleExport}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowExportModal(false)}
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
