const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'data', 'lotto.db');
console.log(`📁 데이터베이스 경로: ${dbPath}`);

// 데이터 디렉토리가 없으면 생성
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 데이터 디렉토리 생성: ${dataDir}`);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err);
    process.exit(1);
  }
  console.log('✅ 데이터베이스 연결 성공');
});

// 동행복권 API 호출 함수
async function fetchLottoData(round) {
  try {
    const response = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.returnValue !== 'success') return null;
    
    return {
      round: data.drwNo,
      date: data.drwNoDate,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6],
      bonusNumber: data.bnusNo,
      totalSales: data.totSellamnt,
      firstWinnerAmount: data.firstWinamnt,
      firstWinnerCount: data.firstPrzwnerCo
    };
  } catch (error) {
    console.error(`${round}회차 데이터 수집 실패:`, error.message);
    return null;
  }
}

// 지연 함수 (API 호출 간격 조절)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 메인 데이터 수집 함수
async function collectLottoData() {
  console.log('🚀 로또 데이터 대량 수집 시작...');
  
  // 테이블 생성
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS lotto_numbers (
      round INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      number1 INTEGER NOT NULL,
      number2 INTEGER NOT NULL,
      number3 INTEGER NOT NULL,
      number4 INTEGER NOT NULL,
      number5 INTEGER NOT NULL,
      number6 INTEGER NOT NULL,
      bonus_number INTEGER NOT NULL,
      total_sales INTEGER,
      first_winner_amount INTEGER,
      first_winner_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  // 현재 저장된 최대 회차 확인
  const maxRound = await new Promise((resolve) => {
    db.get('SELECT MAX(round) as max_round FROM lotto_numbers', (err, row) => {
      if (err) {
        console.log('테이블이 비어있음, 1회차부터 시작');
        resolve(0);
      } else {
        resolve(row?.max_round || 0);
      }
    });
  });

  console.log(`📊 현재 저장된 최대 회차: ${maxRound}회차`);

  // 최신 회차 확인 (API 호출)
  console.log('🔍 최신 회차 확인 중...');
  let latestRound = 1182; // 기본값
  
  for (let round = 1180; round <= 1200; round++) {
    const data = await fetchLottoData(round);
    if (data) {
      latestRound = round;
    } else {
      break;
    }
    await delay(200); // 0.2초 대기
  }

  console.log(`🎯 확인된 최신 회차: ${latestRound}회차`);

  // 수집할 회차 범위 결정
  const startRound = Math.max(1, maxRound + 1);
  const endRound = latestRound;
  const totalRounds = endRound - startRound + 1;

  if (totalRounds <= 0) {
    console.log('✅ 이미 모든 데이터가 최신 상태입니다!');
    db.close();
    return;
  }

  console.log(`📈 수집 계획: ${startRound}회차 ~ ${endRound}회차 (총 ${totalRounds}회차)`);
  console.log(`⏱️ 예상 소요 시간: ${Math.ceil(totalRounds * 0.3 / 60)}분`);

  // 데이터 수집 시작
  let successCount = 0;
  let failCount = 0;
  
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO lotto_numbers 
    (round, date, number1, number2, number3, number4, number5, number6, 
     bonus_number, total_sales, first_winner_amount, first_winner_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let round = startRound; round <= endRound; round++) {
    process.stdout.write(`\r🔄 진행 중: ${round}회차 (${Math.round((round - startRound + 1) / totalRounds * 100)}%)`);
    
    const data = await fetchLottoData(round);
    
    if (data) {
      insertStmt.run(
        data.round,
        data.date,
        data.numbers[0], data.numbers[1], data.numbers[2],
        data.numbers[3], data.numbers[4], data.numbers[5],
        data.bonusNumber,
        data.totalSales,
        data.firstWinnerAmount,
        data.firstWinnerCount
      );
      successCount++;
    } else {
      failCount++;
    }
    
    await delay(300); // 0.3초 대기 (API 부하 방지)
  }

  insertStmt.finalize();

  console.log(`\n\n🎉 데이터 수집 완료!`);
  console.log(`✅ 성공: ${successCount}회차`);
  console.log(`❌ 실패: ${failCount}회차`);

  // 최종 통계
  db.get('SELECT COUNT(*) as total FROM lotto_numbers', (err, row) => {
    if (!err) {
      console.log(`📊 총 저장된 회차: ${row.total}회차`);
    }
    db.close();
    console.log('🏁 데이터베이스 연결 종료');
  });
}

// 실행
collectLottoData().catch(console.error);
