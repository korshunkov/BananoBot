import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import APIKeyManager from './components/APIKeyManager';
import PromptManager from './components/PromptManager';
import ImageUploader from './components/ImageUploader';
import ImageGallery from './components/ImageGallery';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const processImage = async (image, genAI) => {
    try {
      // Используем модель gemini-2.5-flash-image для редактирования изображений
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-image'
      });

      const imagePart = await fileToGenerativePart(image.file);

      // Формируем запрос: сначала изображение, потом промпт
      const result = await model.generateContent([imagePart, { text: prompt }]);
      const response = await result.response;

      // Gemini 2.5 Flash Image возвращает изображение
      // Проверяем, есть ли parts в ответе
      if (response.candidates && response.candidates[0]?.content?.parts) {
        const parts = response.candidates[0].content.parts;

        // Ищем изображение в ответе
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            // Возвращаем изображение в формате data URL
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error('Модель не вернула изображение. Проверьте промпт.');

    } catch (error) {
      console.error('Ошибка при обработке:', error);
      throw new Error(error.message || 'Ошибка обработки изображения');
    }
  };

  const handleProcess = async () => {
    if (!apiKey) {
      alert('Выберите API ключ');
      return;
    }
    if (!prompt) {
      alert('Выберите промпт');
      return;
    }
    if (images.length === 0) {
      alert('Загрузите изображения');
      return;
    }

    setProcessing(true);
    const genAI = new GoogleGenerativeAI(apiKey);

    // Инициализируем результаты
    const initialResults = images.map(img => ({
      id: img.id,
      original: img.preview,
      originalName: img.name,
      processing: true,
      result: null,
      error: null,
    }));
    setResults(initialResults);

    // Обрабатываем изображения последовательно
    for (let i = 0; i < images.length; i++) {
      try {
        const processedImage = await processImage(images[i], genAI);

        setResults(prev => prev.map(r =>
          r.id === images[i].id
            ? { ...r, processing: false, result: processedImage }
            : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r =>
          r.id === images[i].id
            ? { ...r, processing: false, error: error.message }
            : r
        ));
      }
    }

    setProcessing(false);
  };

  const handleRegenerate = async (imageId) => {
    if (!apiKey || !prompt) return;

    const genAI = new GoogleGenerativeAI(apiKey);
    const imageToRegenerate = images.find(img => img.id === imageId);

    if (!imageToRegenerate) return;

    setResults(prev => prev.map(r =>
      r.id === imageId
        ? { ...r, processing: true, error: null }
        : r
    ));

    try {
      const processedImage = await processImage(imageToRegenerate, genAI);

      setResults(prev => prev.map(r =>
        r.id === imageId
          ? { ...r, processing: false, result: processedImage }
          : r
      ));
    } catch (error) {
      setResults(prev => prev.map(r =>
        r.id === imageId
          ? { ...r, processing: false, error: error.message }
          : r
      ));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          Nano Banano Image Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <APIKeyManager onKeySelect={setApiKey} />
          <PromptManager onPromptSelect={setPrompt} />
        </div>

        <ImageUploader onImagesLoad={setImages} />

        {images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={handleProcess}
              disabled={processing || !apiKey || !prompt}
              className={`w-full py-4 rounded-lg font-bold text-xl transition ${
                processing || !apiKey || !prompt
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {processing ? 'Обработка...' : `Запустить обработку (${images.length} изображений)`}
            </button>
          </div>
        )}

        {results.length > 0 && (
          <ImageGallery
            results={results}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  );
}

export default App;
