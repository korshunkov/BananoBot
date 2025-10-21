import { useState } from 'react';

export default function ImageGallery({ results, onRegenerate, onSaveAll, onRetryErrors }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const downloadImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveAllImages = () => {
    results.forEach((result, index) => {
      if (result.result) {
        setTimeout(() => {
          downloadImage(result.result, `processed_${result.originalName || `image_${index}`}`);
        }, index * 100);
      }
    });
    if (onSaveAll) onSaveAll();
  };

  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">{image.originalName}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Оригинал</h4>
              <img
                src={image.original}
                alt="Original"
                className="w-full rounded-lg"
              />
            </div>
            {image.result && (
              <div>
                <h4 className="font-semibold mb-2">Результат</h4>
                <img
                  src={image.result}
                  alt="Result"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="p-4 border-t flex gap-2 justify-end">
            {image.result && (
              <>
                <button
                  onClick={() => downloadImage(image.result, `processed_${image.originalName}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    onRegenerate(image.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Перегенерировать
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (results.length === 0) {
    return null;
  }

  const completedResults = results.filter(r => r.result);
  const processingResults = results.filter(r => r.processing);
  const failedResults = results.filter(r => r.error);

  console.log('ImageGallery results:', results);
  console.log('Failed results:', failedResults);
  console.log('onRetryErrors prop:', onRetryErrors);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Результаты</h2>
          <p className="text-sm text-gray-600">
            Завершено: {completedResults.length} | В процессе: {processingResults.length} | Ошибки: {failedResults.length}
          </p>
        </div>
        <div className="flex gap-3">
          {failedResults.length > 0 && (
            <button
              onClick={onRetryErrors}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              Перегенерировать ошибки ({failedResults.length})
            </button>
          )}
          {completedResults.length > 0 && (
            <button
              onClick={saveAllImages}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Сохранить все ({completedResults.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="relative group cursor-pointer"
            onClick={() => setSelectedImage(result)}
          >
            <div className="relative">
              <img
                src={result.result || result.original}
                alt={result.originalName}
                className={`w-full h-48 object-cover rounded-lg ${
                  result.processing ? 'opacity-50' : ''
                }`}
              />

              {result.processing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}

              {result.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 rounded-lg">
                  <div className="text-center p-2">
                    <p className="text-red-600 font-semibold text-sm">Ошибка</p>
                    <p className="text-xs text-red-500">{result.error}</p>
                  </div>
                </div>
              )}

              {result.result && !result.processing && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(result.result, `processed_${result.originalName}`);
                    }}
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                  >
                    💾
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerate(result.id);
                    }}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  >
                    🔄
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 mt-1 truncate">{result.originalName}</p>
            {result.processing && (
              <p className="text-xs text-purple-600">Обработка...</p>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
