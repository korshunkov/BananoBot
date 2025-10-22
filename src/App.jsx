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
      console.log('🔄 Начало обработки изображения:', image.name);

      const modelName = 'gemini-2.5-flash-image';
      console.log(`🧪 Использование модели: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName
      });

      const imagePart = await fileToGenerativePart(image.file);

      // Формируем более конкретный промпт для редактирования
      const editPrompt = `Transform this image: ${prompt}. Keep the main composition but apply the requested style/changes.`;

      console.log('📤 Отправка запроса с промптом:', editPrompt);

      // Формируем запрос: сначала изображение, потом промпт
      const result = await model.generateContent([imagePart, { text: editPrompt }]);
      const response = await result.response;

      console.log('📦 Ответ от API:', response);

      // Проверяем разные форматы ответа
      if (response.candidates && response.candidates[0]?.content?.parts) {
        const parts = response.candidates[0].content.parts;
        console.log('📝 Части ответа:', parts);

        // Ищем изображение в ответе
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            console.log('✅ Изображение найдено! mimeType:', part.inlineData.mimeType);
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      // Если изображение не найдено
      console.error('❌ Модель не вернула изображение');
      throw new Error('Модель не вернула изображение. Проверьте промпт.');

    } catch (error) {
      console.error('❌ Ошибка при обработке:', error);

      // Проверяем, если это ошибка квоты
      if (error.message && error.message.includes('429')) {
        throw new Error('Превышена квота API. Подождите немного и попробуйте снова.');
      }

      // Проверяем, если это ошибка квоты (альтернативный формат)
      if (error.message && error.message.includes('quota')) {
        throw new Error('Превышена квота API. Подождите немного и попробуйте снова.');
      }

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

  const handleRetryErrors = async () => {
    if (!apiKey || !prompt) return;

    const genAI = new GoogleGenerativeAI(apiKey);
    const failedImages = results.filter(r => r.error);

    if (failedImages.length === 0) return;

    // Устанавливаем статус processing для всех ошибочных изображений
    setResults(prev => prev.map(r =>
      r.error ? { ...r, processing: true, error: null } : r
    ));

    // Обрабатываем все ошибочные изображения последовательно
    for (const failedResult of failedImages) {
      const imageToRetry = images.find(img => img.id === failedResult.id);

      if (!imageToRetry) continue;

      try {
        const processedImage = await processImage(imageToRetry, genAI);

        setResults(prev => prev.map(r =>
          r.id === failedResult.id
            ? { ...r, processing: false, result: processedImage }
            : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r =>
          r.id === failedResult.id
            ? { ...r, processing: false, error: error.message }
            : r
        ));
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          ДжусиЦех
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
            onRetryErrors={handleRetryErrors}
          />
        )}

        <footer className="mt-8 text-center">
          <a
            href="https://t.me/korshunkov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
          >
            KORSHUNKOV
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
