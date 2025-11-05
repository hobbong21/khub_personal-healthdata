import React, { useState } from 'react';
import styles from './SNPTable.module.css';
import { SNPTableProps, SNPData, SortConfig } from './SNPTable.types';

export const SNPTable: React.FC<SNPTableProps> = ({
  data,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key: keyof SNPData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSortKeyDown = (e: React.KeyboardEvent, key: keyof SNPData) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(key);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getSortIcon = (key: keyof SNPData) => {
    if (sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.snpSection} role="region" aria-label="SNP 데이터 테이블">
      <h2 className={styles.sectionTitle}>
        <span aria-hidden="true">🔬</span> SNP 데이터
      </h2>
      
      <div className={styles.tableContainer}>
        <table className={styles.snpTable} role="table" aria-label="SNP 데이터 목록">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('snpId')}
                onKeyDown={(e) => handleSortKeyDown(e, 'snpId')}
                className={styles.sortable}
                role="columnheader"
                aria-sort={sortConfig.key === 'snpId' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                aria-label={`SNP ID로 정렬. 현재 ${sortConfig.key === 'snpId' ? (sortConfig.direction === 'asc' ? '오름차순' : '내림차순') : '정렬 안됨'}`}
              >
                SNP ID <span aria-hidden="true">{getSortIcon('snpId')}</span>
              </th>
              <th 
                onClick={() => handleSort('chromosome')}
                onKeyDown={(e) => handleSortKeyDown(e, 'chromosome')}
                className={styles.sortable}
                role="columnheader"
                aria-sort={sortConfig.key === 'chromosome' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                aria-label={`염색체로 정렬. 현재 ${sortConfig.key === 'chromosome' ? (sortConfig.direction === 'asc' ? '오름차순' : '내림차순') : '정렬 안됨'}`}
              >
                염색체 <span aria-hidden="true">{getSortIcon('chromosome')}</span>
              </th>
              <th 
                onClick={() => handleSort('position')}
                onKeyDown={(e) => handleSortKeyDown(e, 'position')}
                className={styles.sortable}
                role="columnheader"
                aria-sort={sortConfig.key === 'position' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                aria-label={`위치로 정렬. 현재 ${sortConfig.key === 'position' ? (sortConfig.direction === 'asc' ? '오름차순' : '내림차순') : '정렬 안됨'}`}
              >
                위치 <span aria-hidden="true">{getSortIcon('position')}</span>
              </th>
              <th 
                onClick={() => handleSort('genotype')}
                onKeyDown={(e) => handleSortKeyDown(e, 'genotype')}
                className={styles.sortable}
                role="columnheader"
                aria-sort={sortConfig.key === 'genotype' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                aria-label={`유전자형으로 정렬. 현재 ${sortConfig.key === 'genotype' ? (sortConfig.direction === 'asc' ? '오름차순' : '내림차순') : '정렬 안됨'}`}
              >
                유전자형 <span aria-hidden="true">{getSortIcon('genotype')}</span>
              </th>
              <th 
                onClick={() => handleSort('trait')}
                onKeyDown={(e) => handleSortKeyDown(e, 'trait')}
                className={styles.sortable}
                role="columnheader"
                aria-sort={sortConfig.key === 'trait' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                aria-label={`관련 특성으로 정렬. 현재 ${sortConfig.key === 'trait' ? (sortConfig.direction === 'asc' ? '오름차순' : '내림차순') : '정렬 안됨'}`}
              >
                관련 특성 <span aria-hidden="true">{getSortIcon('trait')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((snp, index) => (
              <tr key={`${snp.snpId}-${index}`}>
                <td>{snp.snpId}</td>
                <td>{snp.chromosome}</td>
                <td>{snp.position.toLocaleString()}</td>
                <td className={styles.genotype}>{snp.genotype}</td>
                <td>{snp.trait}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            ←
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`페이지 ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            →
          </button>
        </div>
      )}

      <div className={styles.tableInfo} role="status" aria-live="polite">
        총 {sortedData.length}개의 SNP 데이터 중 {startIndex + 1}-{Math.min(endIndex, sortedData.length)}개 표시
      </div>
    </div>
  );
};
