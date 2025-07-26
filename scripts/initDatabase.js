// 간소화된 데이터베이스 초기화 스크립트
// CommonJS 환경에서 SQLite만 사용하는 버전

const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// API 호출 함수
async function fetchLottoData(drawNumber) {
  const API_BASE_URL = 'https://www.dhlottery.co.kr/common.do';
  const url = `${API_BASE_URL}?method=getLottoNumber&drwNo=${drawNumber}`;
  
  try {
    console.log(`${drawNumber}회차 데이터 수집 중...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.returnValue !== 'success') {
      throw new Error(`API 응답 오류: ${data.returnValue}`);
    }
    
    return {
      round: data.drwNo,
      drawDate: data.drwNoDate,
      numbers: JSON.stringify([data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].sort((a, b) => a - b)),
      bonusNumber: data.bnusNo,
      firstPrize: data.firstWinamnt || 0,
      firstWinners: data.firstPrzwnerCo || 0,
      secondPrize: data.scndWinamnt || 0,
      secondWinners: data.scndPrzwnerCo || 0,
      totalSales: data.totSellamnt || 0
    };
    
  } catch (error) {
    console.error(`${drawNumber}회차 데이터 수집 실패:`, error.message);
    return null;
  }
}

// 여러 회차 데이터 수집
async function fetchMultipleLottoData(startRound, endRound, batchSize = 10) {
  const results = [];
  const total = endRound - startRound + 1;
  
  console.log(`${startRound}회차부터 ${endRound}회차까지 ${total}개 회차 데이터 수집 시작...`);
  
  for (let i = startRound; i <= endRound; i += batchSize) {
    const batchEnd = Math.min(i + batchSize - 1, endRound);
    const batchPromises = [];
    
    for (let round = i; round <= batchEnd; round++) {
      batchPromises.push(fetchLottoData(round));
    }
    
    try {
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null);
      results.push(...validResults);
      
      console.log(`배치 ${i}-${batchEnd} 완료: ${validResults.length}/${batchResults.length} 성공 (누적: ${results.length}/${total})`);
      
      if (batchEnd < endRound) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`배치 ${i}-${batchEnd} 처리 중 오류:`, error);
    }
  }
  
  console.log(`총 ${results.length}개 회차 데이터 수집 완료`);
  return results;
}

// 데이터베이스 생성 및 초기화
function createDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`SQLite 데이터베이스 생성: ${dbPath}`);
        
        // 테이블 생성
        const createTables = [
          `CREATE TABLE IF NOT EXISTS lotto_results (
            round INTEGER PRIMARY KEY,
            draw_date TEXT NOT NULL,
            numbers TEXT NOT NULL,
            bonus_number INTEGER NOT NULL,
            first_prize BIGINT DEFAULT 0,
            first_winners INTEGER DEFAULT 0,
            second_prize BIGINT DEFAULT 0,
            second_winners INTEGER DEFAULT 0,
            total_sales BIGINT DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS statistics_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            max_round INTEGER NOT NULL UNIQUE,
            statistics_data TEXT NOT NULL,
            hot_numbers TEXT NOT NULL,
            cold_numbers TEXT NOT NULL,
            generated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS db_metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`
        ];
        
        let completed = 0;
        createTables.forEach((sql, index) => {
          db.run(sql, (err) => {
            if (err) {
              reject(err);
            } else {
              completed++;
              if (completed === createTables.length) {
                console.log('모든 테이블 생성 완료');
                resolve(db);
              }
            }
          });
        });
      }
    });
  });
}

// 데이터 삽입
function insertLottoResults(db, results) {
  return new Promise((resolve, reject) => {
    console.log(`${results.length}개 로또 데이터 배치 삽입 시작...`);
    
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      const sql = `INSERT OR REPLACE INTO lotto_results 
        (round, draw_date, numbers, bonus_number, first_prize, first_winners, second_prize, second_winners, total_sales)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const stmt = db.prepare(sql);
      
      let completed = 0;
      let hasError = false;
      
      results.forEach((result) => {
        const params = [
          result.round,
          result.drawDate,
          result.numbers,
          result.bonusNumber,
          result.firstPrize,
          result.firstWinners,
          result.secondPrize,
          result.secondWinners,
          result.totalSales
        ];
        
        stmt.run(params, (err) => {
          if (err && !hasError) {
            hasError = true;
            console.error(`배치 삽입 실패 (${result.round}회차):`, err.message);
            db.run("ROLLBACK");
            reject(err);
            return;
          }
          
          completed++;
          if (completed === results.length && !hasError) {
            stmt.finalize();
            db.run("COMMIT", (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`${results.length}개 로또 데이터 배치 삽입 완료`);
                resolve();
              }
            });
          }
        });
      });
    });
  });
}

// 데이터베이스 통계 조회
function getDatabaseStats(db) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT 
      COUNT(*) as total_rounds,
      MAX(round) as latest_round,
      MIN(round) as earliest_round,
      MAX(created_at) as last_updated
      FROM lotto_results`;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          totalRounds: row.total_rounds || 0,
          latestRound: row.latest_round || 0,
          earliestRound: row.earliest_round || 0,
          lastUpdated: row.last_updated || new Date().toISOString()
        });
      }
    });
  });
}

// 메인 초기화 함수
async function initializeDatabase() {
  try {
    console.log('=== 데이터베이스 초기화 시작 ===');
    
    // 데이터 디렉토리 생성
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    console.log(`데이터 디렉토리 생성: ${dataDir}`);
    
    // 데이터베이스 생성
    const dbPath = path.join(dataDir, 'lotto.db');
    const db = await createDatabase(dbPath);
    
    // 기존 데이터 확인
    const stats = await getDatabaseStats(db);
    console.log('현재 데이터베이스 상태:', stats);
    
    if (stats.totalRounds === 0) {
      console.log('데이터베이스가 비어있습니다. 데이터를 수집합니다...');
      
      // API에서 데이터 수집 (1-500회차)
      const lottoData = await fetchMultipleLottoData(1, 500, 8);
      
      if (lottoData.length > 0) {
        await insertLottoResults(db, lottoData);
        
        // 최종 통계 확인
        const finalStats = await getDatabaseStats(db);
        console.log('데이터 저장 완료:', finalStats);
      }
    } else {
      console.log(`데이터베이스에 이미 ${stats.totalRounds}개 회차 데이터가 존재합니다.`);
    }
    
    // 데이터베이스 연결 종료
    await new Promise((resolve) => {
      db.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 실패:', err.message);
        } else {
          console.log('SQLite 데이터베이스 연결 종료');
        }
        resolve();
      });
    });
    
    console.log('=== 데이터베이스 초기화 완료 ===');
    
  } catch (error) {
    console.error('=== 데이터베이스 초기화 실패 ===');
    console.error('에러:', error.message);
    process.exit(1);
  }
}

// 데이터 확장 함수
async function extendDatabase(targetRounds = 1180) {
  try {
    console.log(`=== ${targetRounds}회차까지 데이터 확장 ===`);
    
    const dbPath = path.join(__dirname, '..', 'data', 'lotto.db');
    const db = await createDatabase(dbPath);
    
    const stats = await getDatabaseStats(db);
    console.log('현재 데이터베이스 상태:', stats);
    
    if (stats.latestRound < targetRounds) {
      const startRound = stats.latestRound + 1;
      const endRound = targetRounds;
      
      console.log(`${startRound}회차부터 ${endRound}회차까지 추가 수집...`);
      const newData = await fetchMultipleLottoData(startRound, endRound, 10);
      
      if (newData.length > 0) {
        await insertLottoResults(db, newData);
        console.log(`${newData.length}개 회차 추가 저장 완료`);
      }
    } else {
      console.log('이미 목표 회차까지 데이터가 수집되어 있습니다.');
    }
    
    // 데이터베이스 연결 종료
    await new Promise((resolve) => {
      db.close(() => resolve());
    });
    
    console.log('=== 데이터 확장 완료 ===');
    
  } catch (error) {
    console.error('=== 데이터 확장 실패 ===');
    console.error('에러:', error.message);
    process.exit(1);
  }
}

// 통계 조회 함수
async function showStats() {
  try {
    const dbPath = path.join(__dirname, '..', 'data', 'lotto.db');
    const db = await createDatabase(dbPath);
    
    const stats = await getDatabaseStats(db);
    console.log('데이터베이스 통계:', stats);
    
    await new Promise((resolve) => {
      db.close(() => resolve());
    });
  } catch (error) {
    console.error('통계 조회 실패:', error.message);
  }
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';
  
  switch (command) {
    case 'init':
      await initializeDatabase();
      break;
    case 'extend':
      const targetRounds = parseInt(args[1]) || 1180;
      await extendDatabase(targetRounds);
      break;
    case 'stats':
      await showStats();
      break;
    default:
      console.log('사용법:');
      console.log('  node initDatabase.js init           - 데이터베이스 초기화');
      console.log('  node initDatabase.js extend [회차]   - 데이터 확장 (기본: 1180회차)');
      console.log('  node initDatabase.js stats          - 데이터베이스 통계 조회');
  }
}

if (require.main === module) {
  main();
}
