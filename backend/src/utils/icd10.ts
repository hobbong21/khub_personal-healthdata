/**
 * ICD-10 코드 관련 유틸리티 (요구사항 5.2)
 */

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  subcategory?: string;
}

/**
 * ICD-10 코드 형식 검증
 * 형식: A00-Z99 (3자리) 또는 A00.0-Z99.9 (소수점 포함)
 */
export function validateICD10Code(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // ICD-10 코드 정규식: 알파벳 1자리 + 숫자 2자리 + 선택적 소수점과 숫자 1-2자리
  const icd10Regex = /^[A-Z]\d{2}(\.\d{1,2})?$/;
  return icd10Regex.test(code.toUpperCase());
}

/**
 * ICD-10 코드 정규화 (대문자 변환)
 */
export function normalizeICD10Code(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * ICD-10 카테고리 분류
 */
export function getICD10Category(code: string): string {
  if (!validateICD10Code(code)) {
    return '알 수 없음';
  }

  const firstChar = code.charAt(0).toUpperCase();
  const numericPart = parseInt(code.substring(1, 3));

  // ICD-10 주요 카테고리 분류
  if (firstChar === 'A' || firstChar === 'B') {
    return '감염성 및 기생충성 질환 (A00-B99)';
  } else if (firstChar === 'C' || (firstChar === 'D' && numericPart <= 48)) {
    return '신생물 (C00-D48)';
  } else if (firstChar === 'D' && numericPart >= 50 && numericPart <= 89) {
    return '혈액 및 조혈기관의 질환과 면역기전을 침범하는 특정 장애 (D50-D89)';
  } else if (firstChar === 'E') {
    return '내분비, 영양 및 대사 질환 (E00-E90)';
  } else if (firstChar === 'F') {
    return '정신 및 행동 장애 (F00-F99)';
  } else if (firstChar === 'G') {
    return '신경계통의 질환 (G00-G99)';
  } else if (firstChar === 'H' && numericPart <= 59) {
    return '눈 및 눈 부속기의 질환 (H00-H59)';
  } else if (firstChar === 'H' && numericPart >= 60) {
    return '귀 및 유돌의 질환 (H60-H95)';
  } else if (firstChar === 'I') {
    return '순환계통의 질환 (I00-I99)';
  } else if (firstChar === 'J') {
    return '호흡계통의 질환 (J00-J99)';
  } else if (firstChar === 'K') {
    return '소화계통의 질환 (K00-K93)';
  } else if (firstChar === 'L') {
    return '피부 및 피하조직의 질환 (L00-L99)';
  } else if (firstChar === 'M') {
    return '근골격계통 및 결합조직의 질환 (M00-M99)';
  } else if (firstChar === 'N') {
    return '비뇨생식계통의 질환 (N00-N99)';
  } else if (firstChar === 'O') {
    return '임신, 출산 및 산후기 (O00-O99)';
  } else if (firstChar === 'P') {
    return '주산기에 기원하는 특정 병태 (P00-P96)';
  } else if (firstChar === 'Q') {
    return '선천 기형, 변형 및 염색체 이상 (Q00-Q99)';
  } else if (firstChar === 'R') {
    return '달리 분류되지 않은 증상, 징후와 임상 및 검사의 이상소견 (R00-R99)';
  } else if (firstChar === 'S' || firstChar === 'T') {
    return '손상, 중독 및 외인에 의한 특정 기타 결과 (S00-T98)';
  } else if (firstChar === 'V' || firstChar === 'W' || firstChar === 'X' || firstChar === 'Y') {
    return '질병이환 및 사망의 외인 (V01-Y98)';
  } else if (firstChar === 'Z') {
    return '건강상태에 영향을 주는 요인 및 보건서비스 접촉 (Z00-Z99)';
  }

  return '기타';
}

/**
 * 샘플 ICD-10 코드 데이터 (실제 구현에서는 외부 데이터베이스나 API 사용)
 */
export const SAMPLE_ICD10_CODES: ICD10Code[] = [
  // 감염성 및 기생충성 질환
  { code: 'A00', description: '콜레라', category: '감염성 및 기생충성 질환' },
  { code: 'A09', description: '기타 및 상세불명의 위장염 및 결장염', category: '감염성 및 기생충성 질환' },
  { code: 'B15', description: 'A형 급성 간염', category: '감염성 및 기생충성 질환' },
  { code: 'B16', description: 'B형 급성 간염', category: '감염성 및 기생충성 질환' },
  
  // 신생물
  { code: 'C78', description: '호흡기 및 소화기관의 이차성 악성 신생물', category: '신생물' },
  { code: 'C80', description: '상세불명 부위의 악성 신생물', category: '신생물' },
  
  // 내분비, 영양 및 대사 질환
  { code: 'E10', description: '1형 당뇨병', category: '내분비, 영양 및 대사 질환' },
  { code: 'E11', description: '2형 당뇨병', category: '내분비, 영양 및 대사 질환' },
  { code: 'E78', description: '지단백질 대사장애 및 기타 지질혈증', category: '내분비, 영양 및 대사 질환' },
  
  // 순환계통의 질환
  { code: 'I10', description: '본태성(원발성) 고혈압', category: '순환계통의 질환' },
  { code: 'I20', description: '협심증', category: '순환계통의 질환' },
  { code: 'I21', description: '급성 심근경색증', category: '순환계통의 질환' },
  { code: 'I25', description: '만성 허혈성 심질환', category: '순환계통의 질환' },
  
  // 호흡계통의 질환
  { code: 'J00', description: '급성 비인두염[감기]', category: '호흡계통의 질환' },
  { code: 'J44', description: '기타 만성 폐쇄성 폐질환', category: '호흡계통의 질환' },
  { code: 'J45', description: '천식', category: '호흡계통의 질환' },
  
  // 소화계통의 질환
  { code: 'K29', description: '위염 및 십이지장염', category: '소화계통의 질환' },
  { code: 'K30', description: '기능성 소화불량', category: '소화계통의 질환' },
  { code: 'K59', description: '기타 기능성 장 장애', category: '소화계통의 질환' },
  
  // 근골격계통 및 결합조직의 질환
  { code: 'M54', description: '등통증', category: '근골격계통 및 결합조직의 질환' },
  { code: 'M79', description: '기타 연조직 장애', category: '근골격계통 및 결합조직의 질환' },
  
  // 비뇨생식계통의 질환
  { code: 'N39', description: '비뇨계통의 기타 장애', category: '비뇨생식계통의 질환' },
  
  // 증상, 징후와 임상 및 검사의 이상소견
  { code: 'R50', description: '기타 및 상세불명의 발열', category: '증상, 징후와 임상 및 검사의 이상소견' },
  { code: 'R06', description: '호흡의 이상', category: '증상, 징후와 임상 및 검사의 이상소견' },
  
  // 건강상태에 영향을 주는 요인
  { code: 'Z00', description: '증상 또는 보고된 진단명이 없는 사람의 일반적 검사 및 조사', category: '건강상태에 영향을 주는 요인' },
  { code: 'Z51', description: '기타 의료', category: '건강상태에 영향을 주는 요인' }
];

/**
 * ICD-10 코드 검색
 */
export function searchICD10Codes(searchTerm: string, limit: number = 10): ICD10Code[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return SAMPLE_ICD10_CODES.slice(0, limit);
  }

  const term = searchTerm.toLowerCase().trim();
  
  return SAMPLE_ICD10_CODES
    .filter(code => 
      code.code.toLowerCase().includes(term) ||
      code.description.toLowerCase().includes(term) ||
      code.category.toLowerCase().includes(term)
    )
    .slice(0, limit);
}

/**
 * ICD-10 코드로 상세 정보 조회
 */
export function getICD10CodeDetails(code: string): ICD10Code | null {
  const normalizedCode = normalizeICD10Code(code);
  
  if (!validateICD10Code(normalizedCode)) {
    return null;
  }

  // 샘플 데이터에서 검색
  const found = SAMPLE_ICD10_CODES.find(item => item.code === normalizedCode);
  
  if (found) {
    return found;
  }

  // 샘플 데이터에 없는 경우 기본 정보 반환
  return {
    code: normalizedCode,
    description: '진단명 정보 없음',
    category: getICD10Category(normalizedCode)
  };
}

/**
 * 진단 코드 유효성 검사 및 제안
 */
export function validateAndSuggestICD10(code: string): {
  isValid: boolean;
  normalizedCode?: string;
  suggestions?: ICD10Code[];
  error?: string;
} {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: 'ICD-10 코드를 입력해주세요'
    };
  }

  const normalizedCode = normalizeICD10Code(code);
  
  if (!validateICD10Code(normalizedCode)) {
    // 유사한 코드 제안
    const suggestions = searchICD10Codes(code, 5);
    
    return {
      isValid: false,
      error: '유효하지 않은 ICD-10 코드 형식입니다. 올바른 형식: A00, B15.1',
      suggestions
    };
  }

  return {
    isValid: true,
    normalizedCode
  };
}