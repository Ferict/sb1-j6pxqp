import OpenAI from 'openai';
import type { BaziResult } from './bazi';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_QIANWEN_API_KEY,
  baseURL: import.meta.env.VITE_QIANWEN_API_URL,
  dangerouslyAllowBrowser: true
});

export const generateNamesWithQianwen = async (
  baziResult: BaziResult,
  gender: string,
  style: string,
  lastName: string,
  nameLength: number
): Promise<Array<{ name: string; meaning: string; source: string }>> => {
  const prompt = `你是一个熟悉中国传统命理学的专家，专注于八字排盘与命理分析，并且你也善于根据各类文学国学典籍和八字进行起名。我将提供出生日期和时间、s、姓氏、起名风格的参考，请根据以下条件生成5个合适的中文名字：

生辰八字：
年柱：${baziResult.year}（${baziResult.yearElement}）
月柱：${baziResult.month}（${baziResult.monthElement}）
日柱：${baziResult.day}（${baziResult.dayElement}）
时柱：${baziResult.hour}（${baziResult.hourElement}）

姓氏：${lastName}
性别：${gender}
不包含姓在内的名字字数：${nameLength}字
期望风格：${style}

命理分析建议：${baziResult.luck.join('；')}

若风格中没有包含指定生辰八字，则你不需要输出八字相关的任何信息，直接按照要求起名即可，若包含，你需要：  

1. 根据出生信息排出完整的八字命盘，包括天干、地支、藏干、五行与十神。  
2. 分析日元及命局五行强弱，确定命局格局及喜用神。  
3. 提供以下方面的详细解析：  
   - **性格特点**：结合八字分析性格优势与潜在弱点。  
   - **运势分析**：适合的职业方向、发展建议，以及流年事业预判。


要求：
1. 名字要契合八字五行
2. 考虑音律优美
3. 寓意积极向上
4. 符合选定的文学风格
5. 适合${gender}性使用
6. 不包含姓在内的名字必须是${nameLength}个字
7. 提供准确的出处与相关解释、详细含义以及重名概率;
8. 输出对应拼音
9. 明确指出名字契合点
`;

  try {
    const response = await openai.chat.completions.create({
      model: "qwen-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个精通中国传统文化、易经八字和起名的专家。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || '';
    const namesList = content.split('\n').filter(line => line.trim());
    
    return namesList.map(nameInfo => {
      const [name, meaning, source] = nameInfo.split('：');
      return {
        name: name.replace(/[0-9]/g, '').trim(),
        meaning: meaning?.trim() || '',
        source: source?.trim() || ''
      };
    });
  } catch (error) {
    console.error('Qianwen API error:', error);
    throw new Error('生成名字时出现错误，请稍后重试');
  }
};