import { LifestyleHabits, UserProfile } from '../types/user';

/**
 * 사용자 나이 계산
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 생활습관 점수 계산 (0-100점)
 */
export function calculateLifestyleScore(habits: LifestyleHabits): number {
  let score = 100;
  
  // 흡연 (-30점)
  if (habits.smoking) {
    score -= 30;
  }
  
  // 음주 점수
  switch (habits.alcohol) {
    case 'none':
      // 점수 유지
      break;
    case 'light':
      score -= 5;
      break;
    case 'moderate':
      score -= 15;
      break;
    case 'heavy':
      score -= 25;
      break;
  }
  
  // 운동 점수 (주 3회 이상이 이상적)
  if (habits.exerciseFrequency >= 3) {
    // 보너스 점수 없음 (이미 100점 기준)
  } else if (habits.exerciseFrequency >= 1) {
    score -= 10;
  } else {
    score -= 20;
  }
  
  return Math.max(0, score);
}

/**
 * 건강 위험도 평가 (기본적인 평가)
 */
export function assessBasicHealthRisk(user: UserProfile): {
  riskLevel: 'low' | 'moderate' | 'high';
  factors: string[];
  recommendations: string[];
} {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;
  
  const age = calculateAge(user.birthDate);
  
  // 나이 요인
  if (age > 65) {
    riskScore += 2;
    factors.push('고령 (65세 이상)');
    recommendations.push('정기적인 건강검진을 받으세요');
  } else if (age > 50) {
    riskScore += 1;
    factors.push('중년 (50세 이상)');
  }
  
  // BMI 요인
  if (user.height && user.weight) {
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    
    if (bmi >= 30) {
      riskScore += 2;
      factors.push('비만 (BMI ≥ 30)');
      recommendations.push('체중 감량을 위한 식단 조절과 운동을 시작하세요');
    } else if (bmi >= 25) {
      riskScore += 1;
      factors.push('과체중 (BMI 25-29.9)');
      recommendations.push('적절한 체중 관리가 필요합니다');
    } else if (bmi < 18.5) {
      riskScore += 1;
      factors.push('저체중 (BMI < 18.5)');
      recommendations.push('영양 상담을 받아보세요');
    }
  }
  
  // 생활습관 요인
  if (user.lifestyleHabits) {
    // const lifestyleScore = calculateLifestyleScore(user.lifestyleHabits);
    
    if (user.lifestyleHabits.smoking) {
      riskScore += 3;
      factors.push('흡연');
      recommendations.push('금연을 강력히 권장합니다');
    }
    
    if (user.lifestyleHabits.alcohol === 'heavy') {
      riskScore += 2;
      factors.push('과도한 음주');
      recommendations.push('음주량을 줄이세요');
    }
    
    if (user.lifestyleHabits.exerciseFrequency < 1) {
      riskScore += 2;
      factors.push('운동 부족');
      recommendations.push('주 3회 이상 규칙적인 운동을 시작하세요');
    }
  }
  
  // 위험도 결정
  let riskLevel: 'low' | 'moderate' | 'high';
  if (riskScore >= 5) {
    riskLevel = 'high';
  } else if (riskScore >= 2) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }
  
  // 기본 권장사항
  if (recommendations.length === 0) {
    recommendations.push('현재 건강 상태를 유지하세요');
    recommendations.push('정기적인 건강검진을 받으세요');
  }
  
  return {
    riskLevel,
    factors,
    recommendations,
  };
}

/**
 * 사용자 데이터 마스킹 (개인정보 보호)
 */
export function maskSensitiveData(user: UserProfile): Partial<UserProfile> {
  return {
    id: user.id,
    name: user.name.charAt(0) + '*'.repeat(user.name.length - 1),
    gender: user.gender,
    createdAt: user.createdAt,
  };
}

/**
 * 프로필 완성도 계산
 */
export function calculateProfileCompleteness(user: UserProfile): number {
  const fields = [
    user.name,
    user.birthDate,
    user.gender,
    user.height,
    user.weight,
    user.bloodType,
    user.lifestyleHabits,
  ];
  
  const completedFields = fields.filter(field => 
    field !== null && field !== undefined && field !== ''
  ).length;
  
  return Math.round((completedFields / fields.length) * 100);
}

/**
 * 이메일 도메인 추출
 */
export function extractEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

/**
 * 사용자 표시 이름 생성
 */
export function generateDisplayName(user: UserProfile): string {
  if (user.name) {
    return user.name;
  }
  
  // 이름이 없으면 이메일의 로컬 부분 사용
  const emailLocal = user.email.split('@')[0];
  return emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1);
}

/**
 * 건강 목표 추천
 */
export function recommendHealthGoals(user: UserProfile): string[] {
  const goals: string[] = [];
  const age = calculateAge(user.birthDate);
  
  // BMI 기반 목표
  if (user.height && user.weight) {
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    
    if (bmi >= 25) {
      goals.push('건강한 체중 달성하기');
      goals.push('주 3회 이상 유산소 운동하기');
    } else if (bmi < 18.5) {
      goals.push('적정 체중 늘리기');
      goals.push('균형 잡힌 영양 섭취하기');
    }
  }
  
  // 나이 기반 목표
  if (age >= 40) {
    goals.push('정기 건강검진 받기');
    goals.push('혈압 및 콜레스테롤 관리하기');
  }
  
  // 생활습관 기반 목표
  if (user.lifestyleHabits) {
    if (user.lifestyleHabits.smoking) {
      goals.push('금연하기');
    }
    
    if (user.lifestyleHabits.exerciseFrequency < 3) {
      goals.push('규칙적인 운동 습관 만들기');
    }
    
    if (user.lifestyleHabits.alcohol === 'heavy') {
      goals.push('음주량 줄이기');
    }
  }
  
  // 기본 목표
  if (goals.length === 0) {
    goals.push('건강한 생활습관 유지하기');
    goals.push('스트레스 관리하기');
    goals.push('충분한 수면 취하기');
  }
  
  return goals.slice(0, 5); // 최대 5개 목표
}