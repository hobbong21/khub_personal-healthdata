import React from 'react';
import styles from './ActionButtons.module.css';
import { ActionButtonsProps } from './ActionButtons.types';

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDownloadPDF,
  onShare,
  onExport,
  onPrint,
}) => {
  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      alert('PDF 리포트 생성 중...\n\n실제 구현에서는 jsPDF 또는 react-pdf 라이브러리를 사용하여 PDF를 생성합니다.');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const email = prompt('의료진 이메일 주소를 입력하세요:');
      if (email) {
        const days = prompt('공유 링크 유효 기간 (일):', '30');
        const usePassword = confirm('비밀번호 보호를 사용하시겠습니까?');
        alert(
          `공유 링크가 생성되었습니다!\n\n이메일: ${email}\n유효기간: ${days}일\n비밀번호 보호: ${usePassword ? '예' : '아니오'}\n\n실제 구현에서는 보안 링크가 생성되고 이메일이 전송됩니다.`
        );
      }
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      const format = prompt('내보내기 형식을 선택하세요:\n1. CSV\n2. JSON\n3. Excel', '1');
      let formatName = 'CSV';
      if (format === '2') formatName = 'JSON';
      if (format === '3') formatName = 'Excel';
      alert(
        `${formatName} 형식으로 데이터를 내보냅니다.\n\n실제 구현에서는 선택한 형식으로 데이터가 다운로드됩니다.`
      );
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className={styles.actionButtons}>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleDownloadPDF}>
        <span>📄</span>
        <span>PDF 리포트 다운로드</span>
      </button>
      <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleShare}>
        <span>👨‍⚕️</span>
        <span>의료진과 공유</span>
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleExport}>
        <span>💾</span>
        <span>데이터 내보내기</span>
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handlePrint}>
        <span>🖨️</span>
        <span>인쇄</span>
      </button>
    </div>
  );
};
