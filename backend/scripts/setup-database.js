#!/usr/bin/env node

/**
 * 데이터베이스 설정 스크립트
 * 마이그레이션 실행 및 시드 데이터 삽입
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  console.log('🔄 데이터베이스 마이그레이션을 실행합니다...');
  
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`📄 실행 중: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      await pool.query(migrationSQL);
      console.log(`✅ 완료: ${file}`);
    }
    
    console.log('🎉 모든 마이그레이션이 성공적으로 완료되었습니다!');
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류 발생:', error);
    throw error;
  }
}

async function runSeeds() {
  console.log('🌱 시드 데이터를 삽입합니다...');
  
  try {
    const seedsDir = path.join(__dirname, '../seeds');
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      console.log(`📄 실행 중: ${file}`);
      const seedPath = path.join(seedsDir, file);
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      await pool.query(seedSQL);
      console.log(`✅ 완료: ${file}`);
    }
    
    console.log('🎉 모든 시드 데이터가 성공적으로 삽입되었습니다!');
  } catch (error) {
    console.error('❌ 시드 데이터 삽입 중 오류 발생:', error);
    throw error;
  }
}

async function checkDatabaseConnection() {
  console.log('🔍 데이터베이스 연결을 확인합니다...');
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ 데이터베이스 연결 성공:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    console.error('💡 다음 사항을 확인해주세요:');
    console.error('   - PostgreSQL 서비스가 실행 중인지 확인');
    console.error('   - DATABASE_URL 환경 변수가 올바른지 확인');
    console.error('   - 데이터베이스가 존재하는지 확인');
    return false;
  }
}

async function createDatabase() {
  console.log('🏗️  데이터베이스 생성을 시도합니다...');
  
  try {
    // DATABASE_URL에서 데이터베이스 이름 추출
    const dbUrl = new URL(process.env.DATABASE_URL);
    const dbName = dbUrl.pathname.slice(1); // '/' 제거
    
    // 기본 postgres 데이터베이스에 연결
    dbUrl.pathname = '/postgres';
    const adminPool = new Pool({
      connectionString: dbUrl.toString(),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // 데이터베이스 존재 여부 확인
    const checkResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (checkResult.rows.length === 0) {
      // 데이터베이스 생성
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ 데이터베이스 '${dbName}'가 생성되었습니다.`);
    } else {
      console.log(`ℹ️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
    }
    
    await adminPool.end();
  } catch (error) {
    console.error('❌ 데이터베이스 생성 실패:', error.message);
    throw error;
  }
}

async function resetDatabase() {
  console.log('🗑️  데이터베이스를 초기화합니다...');
  
  try {
    // 모든 테이블 삭제 (CASCADE로 의존성도 함께 삭제)
    const dropTablesQuery = `
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `;
    
    await pool.query(dropTablesQuery);
    console.log('✅ 데이터베이스가 초기화되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';
  
  console.log('🏥 개인 건강 플랫폼 데이터베이스 설정');
  console.log('=====================================');
  
  try {
    switch (command) {
      case 'setup':
        await createDatabase();
        if (await checkDatabaseConnection()) {
          await runMigrations();
          await runSeeds();
        }
        break;
        
      case 'migrate':
        if (await checkDatabaseConnection()) {
          await runMigrations();
        }
        break;
        
      case 'seed':
        if (await checkDatabaseConnection()) {
          await runSeeds();
        }
        break;
        
      case 'reset':
        if (await checkDatabaseConnection()) {
          await resetDatabase();
          await runMigrations();
          await runSeeds();
        }
        break;
        
      case 'check':
        await checkDatabaseConnection();
        break;
        
      default:
        console.log('사용법:');
        console.log('  node setup-database.js [command]');
        console.log('');
        console.log('명령어:');
        console.log('  setup   - 데이터베이스 생성, 마이그레이션 실행, 시드 데이터 삽입 (기본값)');
        console.log('  migrate - 마이그레이션만 실행');
        console.log('  seed    - 시드 데이터만 삽입');
        console.log('  reset   - 데이터베이스 초기화 후 재설정');
        console.log('  check   - 데이터베이스 연결 확인');
        break;
    }
    
    console.log('');
    console.log('🎉 작업이 완료되었습니다!');
    
  } catch (error) {
    console.error('');
    console.error('❌ 작업 실행 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  runMigrations,
  runSeeds,
  checkDatabaseConnection,
  createDatabase,
  resetDatabase
};