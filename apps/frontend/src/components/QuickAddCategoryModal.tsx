import { useState } from 'react';
import Modal from './Modal';
import type { Category } from '../types';

interface QuickAddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: Category) => void;
}

export default function QuickAddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
}: QuickAddCategoryModalProps) {
  const [newCategory, setNewCategory] = useState<Category>({ Name: '', Color: '#10b981' });

  const handleSave = () => {
    if (!newCategory.Name.trim()) return;

    onCategoryAdded(newCategory);
    setNewCategory({ Name: '', Color: '#10b981' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Category">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Name</label>
          <input
            type="text"
            value={newCategory.Name}
            onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
            autoFocus
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
            onClick={handleSave}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Add
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
