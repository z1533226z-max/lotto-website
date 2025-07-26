// SQLite 데이터베이스 연결 및 쿼리 유틸리티
// 로또 데이터를 로컬 데이터베이스에서 관리하기 위한 핵심 클래스

import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import type { LottoResult, NumberStatistics } from '@/types/lotto';

export interface DatabaseStats {
  totalRounds: number;
  latestRound: number;
  earliestRound: number;
  lastUpdated: Date;
}

export class LottoDatabase {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    // 기본적으로 프로젝트 루트의 data 폴더에 저장
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'lotto.db');
  }

  // 데이터베이스 연결
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('SQLite 데이터베이스 연결 실패:', err.message);
          reject(err);
        } else {
          console.log(`SQLite 데이터베이스 연결 성공: ${this.dbPath}`);
          resolve();
        }
      });
    });
  }

  // 데이터베이스 스키마 초기화
  async initializeSchema(): Promise<void> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    const tables = [
      // 로또 결과 테이블
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
      
      // 통계 캐시 테이블
      `CREATE TABLE IF NOT EXISTS statistics_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        max_round INTEGER NOT NULL UNIQUE,
        statistics_data TEXT NOT NULL,
        hot_numbers TEXT NOT NULL,
        cold_numbers TEXT NOT NULL,
        generated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 데이터베이스 메타데이터 테이블
      `CREATE TABLE IF NOT EXISTS db_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = tables.length;

      tables.forEach((sql, index) => {
        this.db!.run(sql, (err) => {
          if (err) {
            console.error(`테이블 생성 실패 (${index}):`, err.message);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            console.log('모든 테이블 생성 완료');
            resolve();
          }
        });
      });
    });
  }

  // 로또 데이터 삽입 (단일)
  async insertLottoResult(result: LottoResult): Promise<void> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    const sql = `INSERT OR REPLACE INTO lotto_results 
      (round, draw_date, numbers, bonus_number, first_prize, first_winners, second_prize, second_winners, total_sales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      result.round,
      result.drawDate,
      JSON.stringify(result.numbers),
      result.bonusNumber,
      result.prizeMoney?.first || 0,
      result.prizeMoney?.firstWinners || 0,
      result.prizeMoney?.second || 0,
      result.prizeMoney?.secondWinners || 0,
      result.prizeMoney?.totalSales || 0
    ];

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          console.error(`로또 데이터 삽입 실패 (${result.round}회차):`, err.message);
          reject(err);
        } else {
          console.log(`로또 데이터 삽입 성공: ${result.round}회차`);
          resolve();
        }
      });
    });
  }

  // 로또 데이터 배치 삽입
  async insertLottoResults(results: LottoResult[]): Promise<void> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    console.log(`${results.length}개 로또 데이터 배치 삽입 시작...`);

    return new Promise((resolve, reject) => {
      this.db!.serialize(() => {
        this.db!.run("BEGIN TRANSACTION");

        const sql = `INSERT OR REPLACE INTO lotto_results 
          (round, draw_date, numbers, bonus_number, first_prize, first_winners, second_prize, second_winners, total_sales)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const stmt = this.db!.prepare(sql);

        let completed = 0;
        let hasError = false;

        results.forEach((result) => {
          const params = [
            result.round,
            result.drawDate,
            JSON.stringify(result.numbers),
            result.bonusNumber,
            result.prizeMoney?.first || 0,
            result.prizeMoney?.firstWinners || 0,
            result.prizeMoney?.second || 0,
            result.prizeMoney?.secondWinners || 0,
            result.prizeMoney?.totalSales || 0
          ];

          stmt.run(params, (err) => {
            if (err && !hasError) {
              hasError = true;
              console.error(`배치 삽입 실패 (${result.round}회차):`, err.message);
              this.db!.run("ROLLBACK");
              reject(err);
              return;
            }

            completed++;
            if (completed === results.length && !hasError) {
              stmt.finalize();
              this.db!.run("COMMIT", (err) => {
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

  // 로또 데이터 조회 (범위)
  async getLottoResults(startRound?: number, endRound?: number): Promise<LottoResult[]> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    let sql = 'SELECT * FROM lotto_results';
    const params: number[] = [];

    if (startRound !== undefined && endRound !== undefined) {
      sql += ' WHERE round BETWEEN ? AND ?';
      params.push(startRound, endRound);
    } else if (startRound !== undefined) {
      sql += ' WHERE round >= ?';
      params.push(startRound);
    } else if (endRound !== undefined) {
      sql += ' WHERE round <= ?';
      params.push(endRound);
    }

    sql += ' ORDER BY round ASC';

    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows: any[]) => {
        if (err) {
          console.error('로또 데이터 조회 실패:', err.message);
          reject(err);
        } else {
          const results: LottoResult[] = rows.map(row => ({
            round: row.round,
            drawDate: row.draw_date,
            numbers: JSON.parse(row.numbers),
            bonusNumber: row.bonus_number,
            prizeMoney: {
              first: row.first_prize,
              firstWinners: row.first_winners,
              second: row.second_prize,
              secondWinners: row.second_winners,
              totalSales: row.total_sales
            }
          }));
          resolve(results);
        }
      });
    });
  }

  // 통계 캐시 저장
  async saveStatisticsCache(maxRound: number, statistics: NumberStatistics[], hotNumbers: NumberStatistics[], coldNumbers: NumberStatistics[]): Promise<void> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    const sql = `INSERT OR REPLACE INTO statistics_cache 
      (max_round, statistics_data, hot_numbers, cold_numbers)
      VALUES (?, ?, ?, ?)`;

    const params = [
      maxRound,
      JSON.stringify(statistics),
      JSON.stringify(hotNumbers),
      JSON.stringify(coldNumbers)
    ];

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          console.error('통계 캐시 저장 실패:', err.message);
          reject(err);
        } else {
          console.log(`통계 캐시 저장 완료: ${maxRound}회차까지`);
          resolve();
        }
      });
    });
  }

  // 통계 캐시 조회
  async getStatisticsCache(maxRound: number): Promise<{
    statistics: NumberStatistics[],
    hotNumbers: NumberStatistics[],
    coldNumbers: NumberStatistics[]
  } | null> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    const sql = 'SELECT * FROM statistics_cache WHERE max_round = ? ORDER BY generated_at DESC LIMIT 1';

    return new Promise((resolve, reject) => {
      this.db!.get(sql, [maxRound], (err, row: any) => {
        if (err) {
          console.error('통계 캐시 조회 실패:', err.message);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            statistics: JSON.parse(row.statistics_data),
            hotNumbers: JSON.parse(row.hot_numbers),
            coldNumbers: JSON.parse(row.cold_numbers)
          });
        }
      });
    });
  }

  // 데이터베이스 통계 조회
  async getDatabaseStats(): Promise<DatabaseStats> {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다');
    }

    const sql = `SELECT 
      COUNT(*) as total_rounds,
      MAX(round) as latest_round,
      MIN(round) as earliest_round,
      MAX(created_at) as last_updated
      FROM lotto_results`;

    return new Promise((resolve, reject) => {
      this.db!.get(sql, [], (err, row: any) => {
        if (err) {
          console.error('데이터베이스 통계 조회 실패:', err.message);
          reject(err);
        } else {
          resolve({
            totalRounds: row.total_rounds || 0,
            latestRound: row.latest_round || 0,
            earliestRound: row.earliest_round || 0,
            lastUpdated: new Date(row.last_updated || Date.now())
          });
        }
      });
    });
  }

  // 데이터베이스 연결 종료
  async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 실패:', err.message);
          reject(err);
        } else {
          console.log('SQLite 데이터베이스 연결 종료');
          this.db = null;
          resolve();
        }
      });
    });
  }
}

// 싱글톤 데이터베이스 인스턴스
let dbInstance: LottoDatabase | null = null;

export function getDatabaseInstance(): LottoDatabase {
  if (!dbInstance) {
    dbInstance = new LottoDatabase();
  }
  return dbInstance;
}

export default LottoDatabase;
