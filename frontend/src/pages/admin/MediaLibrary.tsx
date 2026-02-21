import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Folder, 
  FolderPlus, 
  Trash2, 
  Edit, 
  Image, 
  FileText, 
  Video, 
  Search,
  Grid,
  List,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { mediaService, Media } from '@/services/media';

const MediaLibrary = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState('general');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editModal, setEditModal] = useState<Media | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    loadMedia();
    loadFolders();
  }, [currentFolder, searchQuery]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaService.getAll({
        folder: currentFolder,
        search: searchQuery || undefined,
      });
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await mediaService.getFolders();
      setFolders(['general', ...response.data.filter((f: string) => f !== 'general')]);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentFolder);
        
        await mediaService.upload(formData);
      }
      loadMedia();
    } catch (error) {
      console.error('Failed to upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await mediaService.delete(id);
      loadMedia();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} files?`)) return;
    
    try {
      await mediaService.bulkDelete(selectedItems);
      setSelectedItems([]);
      loadMedia();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await mediaService.createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
      loadFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleUpdateMedia = async () => {
    if (!editModal) return;
    
    try {
      await mediaService.update(editModal.id, {
        alt_text: editModal.alt_text,
        caption: editModal.caption,
      });
      setEditModal(null);
      loadMedia();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600">Upload and manage your media files</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            {/* Folder selector */}
            <select
              value={currentFolder}
              onChange={(e) => setCurrentFolder(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>

            {/* New folder button */}
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View mode */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Upload button */}
            <label className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Files
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </label>

            {/* Bulk delete */}
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedItems.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* New folder modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolder(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Media Details</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={editModal.alt_text}
                  onChange={(e) => setEditModal({ ...editModal, alt_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea
                  value={editModal.caption}
                  onChange={(e) => setEditModal({ ...editModal, caption: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMedia}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        /* Media grid/list */
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          : "space-y-2"
        }>
          {media.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
                selectedItems.includes(item.id) ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid view */}
                  <div className="aspect-square relative bg-gray-100">
                    {item.mime_type.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.alt_text}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(item.mime_type)}
                      </div>
                    )}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedItems.includes(item.id)
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-white bg-white/50'
                      }`}
                    >
                      {selectedItems.includes(item.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.original_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                  </div>
                </>
              ) : (
                /* List view */
                <div className="flex items-center p-3 gap-4">
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedItems.includes(item.id)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedItems.includes(item.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.mime_type.startsWith('image/') ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      getFileIcon(item.mime_type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.original_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditModal(item)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && media.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No media files</h3>
          <p className="text-gray-500">Upload files to get started</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MediaLibrary;

