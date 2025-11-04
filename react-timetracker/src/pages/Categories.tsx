import { useState, useEffect } from 'react';
import { categoriesApi } from '../api';
import { Category } from '../types';
import Modal from '../components/Modal';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>({ Name: '', Color: '#10b981' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentCategory({ Name: '', Color: '#10b981' });
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCurrentCategory({
      Id: category.Id,
      Name: category.Name,
      Color: category.Color,
      IsArchived: category.IsArchived,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory({ Name: '', Color: '#10b981' });
    setEditingCategory(null);
  };

  const saveCategory = async () => {
    if (!currentCategory.Name.trim()) return;

    try {
      if (editingCategory && currentCategory.Id) {
        await categoriesApi.update(currentCategory.Id, currentCategory);
      } else {
        await categoriesApi.create(currentCategory);
      }
      await loadCategories();
      closeModal();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const archiveCategory = async (id: number) => {
    try {
      await categoriesApi.archive(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to archive category:', error);
    }
  };

  const unarchiveCategory = async (id: number) => {
    try {
      await categoriesApi.unarchive(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to unarchive category:', error);
    }
  };

  const deleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this category?')) {
      try {
        await categoriesApi.delete(id);
        await loadCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const activeCategories = categories.filter((c) => !c.IsArchived);
  const archivedCategories = categories.filter((c) => c.IsArchived);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Categories</h1>
          <button
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
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
            Add Category
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Active Categories */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Active Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCategories.map((category) => (
                  <div key={category.Id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.Color }}
                        ></div>
                        <span className="font-medium">{category.Name}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => category.Id && archiveCategory(category.Id)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Archived Categories */}
            {archivedCategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-400">Archived Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedCategories.map((category) => (
                    <div
                      key={category.Id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-800 opacity-60"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.Color }}
                          ></div>
                          <span className="font-medium">{category.Name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => category.Id && unarchiveCategory(category.Id)}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition-colors"
                        >
                          Unarchive
                        </button>
                        <button
                          onClick={() => category.Id && deleteCategory(category.Id)}
                          className="flex-1 bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded text-sm transition-colors"
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
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Name</label>
            <input
              type="text"
              value={currentCategory.Name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, Name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentCategory.Color}
                onChange={(e) => setCurrentCategory({ ...currentCategory, Color: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 h-10 w-20"
              />
              <input
                type="text"
                value={currentCategory.Color}
                onChange={(e) => setCurrentCategory({ ...currentCategory, Color: e.target.value })}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                placeholder="#10b981"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={saveCategory}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={closeModal}
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
