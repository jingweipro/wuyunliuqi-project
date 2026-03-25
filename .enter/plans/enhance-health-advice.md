# Plan: Enhance Personal Health Advice Module

## Context
The current health advice module provides generic, formulaic advice. The user wants richer, more specific and personalized health guidance based on:
- Birth year (先天禀赋)
- Birth location (地域因素)
- Current year's 五运六气
- The interaction between birth constitution and current climate

The advice from 搜索 (like the 2026 丙午年 detailed analysis from tao-clinic.com) shows what good 五运六气 health advice looks like - specific climate descriptions, concrete disease risks with symptoms, detailed food therapy, tea formulas, and lifestyle guidance per qi period.

## Approach: Rewrite health-advice.ts + health-advice-data.ts + HealthAdvice.tsx

### 1. New data file: `src/lib/health-advice-data.ts`
Rich, detailed data covering:

**A. 先天禀赋深度分析 (by birth year 五行 + 太过/不及)**
- 10 types (5 elements x 太过/不及), each with:
  - 体质特征 (body shape, skin, voice, temperament)
  - 脏腑强弱 (which organs are strong/weak)
  - 易患疾病 (specific diseases prone to)
  - 情志特点 (emotional tendencies)
  - 最佳养护方向

**B. 司天在泉年度详解 (6 types for 6 pairs)**
- Year-level climate overview
- 药食宜忌 from 《素问》 original text (e.g., "其化上咸寒，中咸热，下酸温")
- 全年养生总纲

**C. 六气时段详细建议 (6 periods x 6 客气 = 36 combinations)**
Each with:
- 详细气候特征 (2-3 sentences describing specific weather)
- 易发疾病 (3-5 specific diseases with symptoms)
- 食疗方案 (5+ specific foods with preparation methods)
- 代茶饮 (1-2 tea formulas with ingredients and usage)
- 穴位经络 (3-4 acupoints with meridian, location, technique)
- 起居调摄 (sleep, bathing, dressing advice)
- 情志调养 (emotional management)
- 运动建议 (exercise type and intensity)

**D. 地域因素修正 (by region)**
- 5 major climate zones (东南沿海湿热, 西北干燥寒冷, 华中温和, 东北严寒, 西南温湿)
- Each modifies advice slightly (e.g., "岭南地区湿气更重，需加强祛湿")

**E. 岁运与体质交互分析**
- 5x5 matrix: birth五行 vs year五行 interaction descriptions
- Specific risk warnings and protection strategies

### 2. Rewrite `src/lib/health-advice.ts`
- `getBirthConstitution()` - Much richer output with 脏腑强弱, 易患疾病, 情志特点
- `generateQiHealthAdvice()` - Pull from the 36 combination data, customize by body type
- `generateYearHealthAdvice()` - Include 内经原文 quotes, year-level 药食宜忌
- `getRegionModifier()` - New function for location-based advice
- `getCurrentQiHighlight()` - New function to highlight current qi period urgently
- `getConstitutionYearInteraction()` - New function for birth/year cross analysis

### 3. Rewrite `src/pages/HealthAdvice.tsx`
Complete redesign with richer sections:
- **当前时令提醒** (top banner): Current qi period with urgent advice, highlighted
- **先天禀赋分析** (expanded): Body type, organ strength chart, disease tendencies, emotional traits
- **年度运气总览**: Year overview with 内经原文, 药食宜忌 principles
- **六气详解** (per-period cards, current one expanded by default):
  - Climate description
  - Disease risks with symptoms
  - Food therapy (with recipes/preparation)
  - Tea formula card
  - Acupoint cards with meridian info
  - Lifestyle guidance
  - Exercise recommendations
- **地域养生**: Region-specific modifications
- **方药推荐**: Keep existing prescriptions but better organized
- **全年饮食日历**: A visual summary of what to eat/avoid each season

### Files to modify:
- `src/lib/health-advice-data.ts` (NEW) - All rich data
- `src/lib/health-advice.ts` - Rewrite with richer logic
- `src/pages/HealthAdvice.tsx` - Rewrite UI with more sections

### Files to keep unchanged:
- `src/lib/wuyun-liuqi.ts` - Reuse existing calculation functions
- `src/lib/sanyinsitian-fang.ts` - Reuse existing prescription data

## Verification
- Check that health advice page loads correctly for various birth years
- Verify the current qi period is highlighted
- Ensure advice changes meaningfully when switching years
- Check that different birth years produce different constitution analyses
- Verify responsive layout on mobile
