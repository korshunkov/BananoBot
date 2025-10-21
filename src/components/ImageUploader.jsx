import { useState } from 'react';

export default function ImageUploader({ onImagesLoad }) {
  const [dragActive, setDragActive] = useState(false);
  const [loadedImages, setLoadedImages] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file: file,
            preview: e.target.result,
            name: file.name,
            id: Date.now() + Math.random()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(imagePromises);
    const updatedImages = [...loadedImages, ...newImages];
    setLoadedImages(updatedImages);
    onImagesLoad(updatedImages);
  };

  const removeImage = (id) => {
    const updated = loadedImages.filter(img => img.id !== id);
    setLoadedImages(updated);
    onImagesLoad(updated);
  };

  const clearAll = () => {
    setLoadedImages([]);
    onImagesLoad([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Загрузка изображений</h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Перетащите изображения сюда
          </p>
          <p className="text-sm text-gray-500 mb-4">или</p>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Выбрать файлы
          </button>
        </label>
      </div>

      {loadedImages.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Загружено изображений: {loadedImages.length}
            </h3>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Очистить все
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadedImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">{img.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
