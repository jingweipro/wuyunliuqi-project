// 三因司天方 - 根据顾植山五运六气理论整理
// 三因司天方出自宋代陈无择《三因极一病证方论》

export interface Prescription {
  name: string;
  composition: string[];
  dosage: string;
  usage: string;
  indication: string;
  explanation: string;
}

export interface SiTianFang {
  siTian: string;
  zaiQuan: string;
  yearBranches: string[];
  climateFeature: string;
  diseaseFeature: string;
  prescriptions: Prescription[];
  dietAdvice: string[];
  acupointAdvice: string[];
}

// 六年司天方
export const SI_TIAN_FANG: Record<string, SiTianFang> = {
  '厥阴风木': {
    siTian: '厥阴风木',
    zaiQuan: '少阳相火',
    yearBranches: ['巳', '亥'],
    climateFeature: '上半年风气偏盛，春行秋令，气候多变；下半年火气偏盛，温热多见',
    diseaseFeature: '上半年多肝胆风木之病，胁痛目眩，筋挛抽搐；下半年多三焦相火之病，心烦口苦，发热',
    prescriptions: [
      {
        name: '敷和汤',
        composition: ['木香', '半夏', '厚朴', '茯苓', '紫苏', '橘皮', '甘草', '枳壳', '藿香', '生姜'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '厥阴风木司天之年，风淫所胜，民病胃脘当心而痛，上支两胁，膈咽不通',
        explanation: '方以木香、藿香芳香醒脾，半夏、厚朴、枳壳行气消痞，茯苓健脾渗湿，紫苏、橘皮理气宽中，甘草调和诸药。合用有疏风和中、理气止痛之效。'
      },
      {
        name: '审平汤',
        composition: ['沙参', '五味子', '麦冬', '白芍', '玄参', '生地', '丹皮', '川芎', '甘草', '炙甘草'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '少阳相火在泉之年，火淫所胜，民病注泄赤白，少腹痛溺赤',
        explanation: '方以沙参、麦冬、玄参、生地滋阴清热，五味子收敛固涩，白芍养血柔肝，丹皮清热凉血，川芎活血行气，甘草调和。合用滋阴降火、清热养血。'
      }
    ],
    dietAdvice: [
      '上半年宜食甘缓之品，如大枣、蜂蜜、山药，以缓肝木',
      '下半年宜食苦寒之品，如苦瓜、莲子心，以清相火',
      '忌食辛辣燥热之物，如辣椒、羊肉、狗肉',
      '宜多食绿色蔬菜以养肝'
    ],
    acupointAdvice: [
      '太冲穴：平肝息风，疏肝理气',
      '阳陵泉：疏肝利胆，舒筋活络',
      '行间穴：清泄肝火，凉血活血',
      '内关穴：宁心安神，理气和胃'
    ]
  },

  '少阴君火': {
    siTian: '少阴君火',
    zaiQuan: '阳明燥金',
    yearBranches: ['子', '午'],
    climateFeature: '上半年热气偏盛，气候炎热；下半年燥气偏盛，干燥少雨',
    diseaseFeature: '上半年多心火亢盛之病，心烦失眠，口舌生疮；下半年多肺金燥热之病，咳嗽干咳，皮肤干燥',
    prescriptions: [
      {
        name: '正阳汤',
        composition: ['黄芩', '甘草', '桔梗', '玄参', '升麻', '鼠粘子', '白芍', '生地', '知母', '黄柏'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '少阴君火司天之年，热淫所胜，民病胸中烦热，嗌干，右胠满，皮肤痛',
        explanation: '方以黄芩、知母、黄柏清热泻火，玄参、生地滋阴清热，白芍养血柔肝，桔梗、升麻、鼠粘子宣散上焦热毒，甘草调和诸药。合用清热泻火、滋阴生津。'
      },
      {
        name: '静顺汤',
        composition: ['木瓜', '茯苓', '杏仁', '附子', '肉桂', '牛膝', '麦冬', '五味子', '生姜', '大枣'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '阳明燥金在泉之年，燥淫所胜，民病喜呕，呕有苦，善太息',
        explanation: '方以木瓜、牛膝滋养肝肾，茯苓健脾渗湿，杏仁宣肺润燥，附子、肉桂温阳散寒，麦冬、五味子滋阴敛肺，姜枣调和。合用滋阴润燥、温阳散寒。'
      }
    ],
    dietAdvice: [
      '上半年宜食苦寒之品，如苦瓜、莲子心、绿豆，以清君火',
      '下半年宜食润肺之品，如百合、银耳、梨、蜂蜜',
      '忌食辛燥之物，以免助火伤阴',
      '宜多饮水，保持津液充足'
    ],
    acupointAdvice: [
      '劳宫穴：清心泻火，醒神开窍',
      '神门穴：宁心安神，清心降火',
      '太渊穴：补肺益气，清肺润燥',
      '列缺穴：宣肺解表，通络止痛'
    ]
  },

  '太阴湿土': {
    siTian: '太阴湿土',
    zaiQuan: '太阳寒水',
    yearBranches: ['丑', '未'],
    climateFeature: '上半年湿气偏盛，阴雨连绵；下半年寒气偏盛，天气寒冷',
    diseaseFeature: '上半年多脾湿之病，胸满腹胀，身重肢倦；下半年多肾寒之病，腰膝冷痛，小便清长',
    prescriptions: [
      {
        name: '备化汤',
        composition: ['木香', '白术', '厚朴', '茯苓', '紫苏', '橘皮', '甘草', '藿香', '半夏', '生姜'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '太阴湿土司天之年，湿淫所胜，民病饮积心痛，耳聋浑浑焞焞，身重足痿',
        explanation: '方以木香、藿香芳香化湿，白术、茯苓健脾利水，厚朴、半夏燥湿化痰，紫苏、橘皮理气宽中，甘草调和。合用健脾化湿、理气消满。'
      },
      {
        name: '升明汤',
        composition: ['附子', '肉桂', '干姜', '吴茱萸', '白术', '茯苓', '甘草', '半夏', '陈皮', '生姜'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '太阳寒水在泉之年，寒淫所胜，民病少腹控睾引腰脊，上冲心痛',
        explanation: '方以附子、肉桂、干姜、吴茱萸大辛大热，温阳散寒，白术、茯苓健脾利水，半夏、陈皮理气化痰，甘草调和。合用温阳散寒、健脾利水。'
      }
    ],
    dietAdvice: [
      '上半年宜食健脾化湿之品，如薏米、扁豆、山药、芡实',
      '下半年宜食温阳散寒之品，如羊肉、生姜、肉桂、胡椒',
      '忌食生冷油腻之物，以免伤脾助湿',
      '宜适量运动，促进湿气排出'
    ],
    acupointAdvice: [
      '足三里：健脾益气，化湿和胃',
      '阴陵泉：健脾利湿，通利小便',
      '关元穴：温阳散寒，补益肾气',
      '命门穴：温肾壮阳，强腰膝'
    ]
  },

  '少阳相火': {
    siTian: '少阳相火',
    zaiQuan: '厥阴风木',
    yearBranches: ['寅', '申'],
    climateFeature: '上半年火气偏盛，温热多见；下半年风气偏盛，气候多变',
    diseaseFeature: '上半年多三焦火热之病，发热口苦，目赤肿痛；下半年多肝胆风木之病，头痛眩晕，筋脉拘急',
    prescriptions: [
      {
        name: '升明汤',
        composition: ['白芍', '生地', '黄芩', '黄连', '玄参', '石膏', '知母', '栀子', '连翘', '甘草'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '少阳相火司天之年，火淫所胜，民病目赤肿痛，寒热如疟，热甚则咳',
        explanation: '方以石膏、知母清泻肺胃之热，黄芩、黄连、栀子清泻三焦火热，白芍、生地、玄参滋阴养血，连翘清热解毒，甘草调和。合用清泻相火、滋阴降火。'
      },
      {
        name: '敷和汤',
        composition: ['柴胡', '白芍', '川芎', '当归', '白术', '茯苓', '甘草', '薄荷', '生姜', '大枣'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '厥阴风木在泉之年，风淫所胜，民病洒洒振寒，善伸数欠',
        explanation: '方以柴胡疏肝解郁，白芍养血柔肝，当归、川芎养血活血，白术、茯苓健脾益气，薄荷疏散风热，姜枣调和。合用疏肝解郁、养血柔肝。'
      }
    ],
    dietAdvice: [
      '上半年宜食苦寒之品，如黄瓜、西瓜、绿豆、苦瓜',
      '下半年宜食酸甘之品，如山楂、乌梅、柠檬、大枣',
      '忌食辛辣燥热之物',
      '宜保持心情舒畅，避免肝气郁结'
    ],
    acupointAdvice: [
      '支沟穴：清泄三焦，通便泄热',
      '外关穴：清热解毒，通经活络',
      '太冲穴：平肝息风，疏肝理气',
      '期门穴：疏肝理气，活血化瘀'
    ]
  },

  '阳明燥金': {
    siTian: '阳明燥金',
    zaiQuan: '少阴君火',
    yearBranches: ['卯', '酉'],
    climateFeature: '上半年燥气偏盛，气候干燥；下半年火气偏盛，温热多见',
    diseaseFeature: '上半年多肺金燥热之病，咳嗽气喘，鼻干咽燥；下半年多心火亢盛之病，心烦失眠，口舌生疮',
    prescriptions: [
      {
        name: '审平汤',
        composition: ['沙参', '麦冬', '天冬', '百合', '川贝母', '杏仁', '桑叶', '白芍', '甘草', '梨皮'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '阳明燥金司天之年，燥淫所胜，民病咳嗽喘息，寒热往来，口苦',
        explanation: '方以沙参、麦冬、天冬、百合滋阴润肺，川贝母、杏仁化痰止咳，桑叶清肺润燥，白芍养血柔肝，梨皮清热生津，甘草调和。合用滋阴润肺、清热化痰。'
      },
      {
        name: '正阳汤',
        composition: ['生地', '玄参', '麦冬', '连翘', '黄芩', '丹参', '白芍', '甘草', '灯心草', '竹叶'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '少阴君火在泉之年，热淫所胜，民病注泄赤白，少腹痛，溺赤',
        explanation: '方以生地、玄参、麦冬滋阴清热，连翘、黄芩清热解毒，丹参活血安神，白芍养血柔肝，灯心草、竹叶清心利尿，甘草调和。合用滋阴降火、清心安神。'
      }
    ],
    dietAdvice: [
      '上半年宜食润肺生津之品，如梨、银耳、百合、蜂蜜',
      '下半年宜食清心泻火之品，如莲子心、苦瓜、绿豆汤',
      '忌食辛燥之物，如辣椒、胡椒、油炸食品',
      '宜多饮水，保持呼吸道湿润'
    ],
    acupointAdvice: [
      '合谷穴：清热解表，通经活络',
      '曲池穴：清热泻火，调和气血',
      '少府穴：清心泻火，安神定志',
      '通里穴：清心安神，通络止痛'
    ]
  },

  '太阳寒水': {
    siTian: '太阳寒水',
    zaiQuan: '太阴湿土',
    yearBranches: ['辰', '戌'],
    climateFeature: '上半年寒气偏盛，气候寒冷；下半年湿气偏盛，阴雨多见',
    diseaseFeature: '上半年多寒邪犯肾之病，腰背冷痛，小便清长；下半年多脾湿之病，腹胀便溏，肢体困重',
    prescriptions: [
      {
        name: '静顺汤',
        composition: ['附子', '肉桂', '干姜', '白术', '茯苓', '甘草', '人参', '黄芪', '当归', '大枣'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '太阳寒水司天之年，寒淫所胜，民病寒厥于肠，上冲胸中，甚则善忘',
        explanation: '方以附子、肉桂、干姜温阳散寒，白术、茯苓健脾利水，人参、黄芪大补元气，当归养血活血，甘草、大枣调和。合用温阳散寒、益气健脾。'
      },
      {
        name: '备化汤',
        composition: ['苍术', '厚朴', '陈皮', '半夏', '茯苓', '甘草', '藿香', '砂仁', '木香', '生姜'],
        dosage: '各等分',
        usage: '水煎服，日一剂',
        indication: '太阴湿土在泉之年，湿淫所胜，民病腹胀身重，濡泄寒中',
        explanation: '方以苍术、厚朴、半夏燥湿化痰，陈皮、木香、砂仁理气消胀，茯苓健脾利水，藿香芳香化湿，甘草、生姜调和。合用燥湿健脾、理气消胀。'
      }
    ],
    dietAdvice: [
      '上半年宜食温阳散寒之品，如羊肉、牛肉、生姜、韭菜',
      '下半年宜食健脾化湿之品，如薏米、山药、茯苓、扁豆',
      '忌食生冷寒凉之物',
      '宜适当运动，增强阳气'
    ],
    acupointAdvice: [
      '肾俞穴：温肾壮阳，强腰膝',
      '关元穴：温阳散寒，补益元气',
      '脾俞穴：健脾化湿，理气和中',
      '中脘穴：健脾和胃，理气止痛'
    ]
  }
};

// 根据年份获取司天在泉
export function getSiTianZaiQuanByYear(zhi: string): SiTianFang | null {
  for (const key in SI_TIAN_FANG) {
    if (SI_TIAN_FANG[key].yearBranches.includes(zhi)) {
      return SI_TIAN_FANG[key];
    }
  }
  return null;
}

// 获取六气时段的方药建议
export function getQiFangAdvice(qiIndex: number, keQi: string): {
  prescription: Prescription | null;
  advice: string;
} {
  const qiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];
  
  // 根据客气确定主要病机
  const qiPrescriptions: Record<string, { advice: string; relatedSiTian: string }> = {
    '厥阴风木': { advice: '此时风气偏盛，宜疏风和中，注意肝胆调养', relatedSiTian: '厥阴风木' },
    '少阴君火': { advice: '此时热气偏盛，宜清热养阴，注意心肾调养', relatedSiTian: '少阴君火' },
    '太阴湿土': { advice: '此时湿气偏盛，宜健脾化湿，注意脾胃调养', relatedSiTian: '太阴湿土' },
    '少阳相火': { advice: '此时火气偏盛，宜清泄相火，注意三焦调养', relatedSiTian: '少阳相火' },
    '阳明燥金': { advice: '此时燥气偏盛，宜润肺生津，注意肺金调养', relatedSiTian: '阳明燥金' },
    '太阳寒水': { advice: '此时寒气偏盛，宜温阳散寒，注意肾水调养', relatedSiTian: '太阳寒水' },
  };
  
  const info = qiPrescriptions[keQi];
  if (!info) return { prescription: null, advice: '' };
  
  const siTianFang = SI_TIAN_FANG[info.relatedSiTian];
  
  return {
    prescription: siTianFang?.prescriptions[0] || null,
    advice: `${qiNames[qiIndex]}（${keQi}客气）：${info.advice}`
  };
}
