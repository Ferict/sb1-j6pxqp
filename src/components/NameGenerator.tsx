import React, { useState } from 'react';
import { ScrollText, BookOpen, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateBazi } from '../utils/bazi';
import { generateNames } from '../utils/openai';
import { generateNamesWithQianwen } from '../utils/qianwen';
import BaziAnalysis from './BaziAnalysis';

interface NameResult {
  name: string;
  meaning: string;
  source: string;
}

const NAMING_STYLES = [
  '自由发挥', '生辰八字', '唐诗', '宋词', '大学', '中庸', '论语', '孟子', 
  '诗经', '尚书', '礼记', '周易', '春秋', '楚辞', '汉赋', '洛神赋', 
  '寒窑赋', '朱子家训', '太平御览', 'MBTI性格+星座'
];

const THEMES = [
  { id: 'classic', name: '古典书卷', bgImage: 'https://images.unsplash.com/photo-1582640731857-99cc3c2b2c16' },
  { id: 'ink', name: '水墨丹青', bgImage: 'https://images.unsplash.com/photo-1582640731857-99cc3c2b2c16' },
  { id: 'modern', name: '现代国风', bgImage: 'https://images.unsplash.com/photo-1582640731857-99cc3c2b2c16' }
];

const NameGenerator: React.FC = () => {
  const [lastName, setLastName] = useState('');
  const [birthDateTime, setBirthDateTime] = useState('');
  const [gender, setGender] = useState('');
  const [nameLength, setNameLength] = useState(2);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState('gpt');
  const [results, setResults] = useState<NameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [baziResult, setBaziResult] = useState(null);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);

  const handleStyleChange = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const generateName = async () => {
    if (selectedStyles.length === 0) {
      setError('请至少选择一种起名风格');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dateTime = new Date(birthDateTime);
      const bazi = calculateBazi(dateTime, dateTime.getHours());
      setBaziResult(bazi);

      let names;
      if (aiModel === 'gpt') {
        names = await generateNames(bazi, gender, selectedStyles.join('、'));
      } else {
        names = await generateNamesWithQianwen(bazi, gender, selectedStyles.join('、'));
      }
      setResults(names);
    } catch (err) {
      setError(err.message || '生成名字时出现错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-8"
      >
        <div className="mb-6 flex justify-center space-x-4">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-lg transition-all ${
                theme.id === t.id 
                  ? 'bg-red-700 text-white' 
                  : 'bg-white/80 hover:bg-red-50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="chinese-pattern rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
            个人信息
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓氏
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value.slice(0, 20))}
                maxLength={20}
                placeholder="请输入姓氏"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 bg-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出生日期时间
              </label>
              <input
                type="datetime-local"
                value={birthDateTime}
                onChange={(e) => setBirthDateTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 bg-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 bg-white/50"
              >
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名字长度
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="1"
                    checked={nameLength === 1}
                    onChange={(e) => setNameLength(Number(e.target.value))}
                    className="form-radio text-red-700"
                  />
                  <span className="ml-2">单字</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="2"
                    checked={nameLength === 2}
                    onChange={(e) => setNameLength(Number(e.target.value))}
                    className="form-radio text-red-700"
                  />
                  <span className="ml-2">双字</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                起名风格（可多选）
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {NAMING_STYLES.map(style => (
                  <label key={style} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(style)}
                      onChange={() => handleStyleChange(style)}
                      className="form-checkbox text-red-700"
                    />
                    <span className="ml-2 text-sm">{style}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI模型
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 bg-white/50"
              >
                <option value="gpt">GPT-4</option>
                <option value="qianwen">通义千问</option>
              </select>
            </div>

            <button
              onClick={generateName}
              disabled={loading || !birthDateTime || !gender || !lastName}
              className="w-full bg-red-700 text-white py-3 px-4 rounded-md hover:bg-red-800 disabled:bg-gray-400 transition duration-200 font-medium"
            >
              {loading ? '正在分析八字生成名字...' : '开始起名'}
            </button>

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
          </div>
        </div>

        {baziResult && <BaziAnalysis bazi={baziResult} />}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="scroll-bg rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
              推荐名字
            </h2>
            
            <div className="space-y-6">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200 bg-white/50"
                >
                  <h3 className="text-3xl font-bold text-red-700 mb-3">
                    {lastName}{result.name}
                  </h3>
                  <p className="text-gray-700 mb-3 text-lg">{result.meaning}</p>
                  <p className="text-sm text-gray-600 italic">{result.source}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="chinese-pattern rounded-lg p-6 text-center"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-4 text-red-700" />
            <h3 className="text-lg font-semibold mb-2">传统文化传承</h3>
            <p className="text-gray-600">融合诗经、道德经等传统文化精髓</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="chinese-pattern rounded-lg p-6 text-center"
          >
            <Compass className="w-8 h-8 mx-auto mb-4 text-red-700" />
            <h3 className="text-lg font-semibold mb-2">八字五行分析</h3>
            <p className="text-gray-600">根据生辰八字，选择最适合的名字</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="chinese-pattern rounded-lg p-6 text-center"
          >
            <ScrollText className="w-8 h-8 mx-auto mb-4 text-red-700" />
            <h3 className="text-lg font-semibold mb-2">双AI智能推荐</h3>
            <p className="text-gray-600">GPT-4与通义千问双引擎，提供更全面的起名建议</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NameGenerator;