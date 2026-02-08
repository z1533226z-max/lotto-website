'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import type { AIPredictionWithResult, AIPrediction } from '@/data/aiPredictionHistory';

interface AIStats {
  avgMatch: number;
  maxMatch: number;
  totalPredictions: number;
  threeOrMore: number;
}

export default function AIHitsPage() {
  const [results, setResults] = useState<AIPredictionWithResult[]>([]);
  const [stats, setStats] = useState<AIStats>({ avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0 });
  const [nextPrediction, setNextPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai-predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.matchResults || []);
          setStats(data.stats || { avgMatch: 0, maxMatch: 0, totalPredictions: 0, threeOrMore: 0 });
          setNextPrediction(data.nextPrediction || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: 'AI 적중 기록' },
      ]} />

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        AI 추천번호 적중 기록
      </h1>
      <p className="text-gray-600 mb-6">
        로또킹 AI가 추천한 번호의 실제 적중 현황
      </p>

      {/* 다음 회차 AI 추천번호 */}
      {nextPrediction && (
        <Card className="mb-6 border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className="font-bold text-purple-800 text-lg">
                {nextPrediction.round}회 AI 추천번호
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                추첨 전
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {nextPrediction.predictedNumbers.map(n => (
                <span
                  key={n}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md"
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              예측일: {nextPrediction.predictedAt} | AI 통계분석 기반 생성
            </p>
          </div>
        </Card>
      )}

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-sm text-gray-600">총 예측</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalPredictions}회</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">평균 적중</p>
          <p className="text-2xl font-bold text-primary">{stats.avgMatch}개</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">최고 적중</p>
          <p className="text-2xl font-bold text-secondary">{stats.maxMatch}개</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50">
          <p className="text-sm text-gray-600">3개 이상 적중</p>
          <p className="text-2xl font-bold text-orange-600">{stats.threeOrMore}회</p>
        </Card>
      </div>

      {/* 적중 기록 목록 */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">회차별 적중 기록</h2>
      <div className="space-y-4">
        {results.map((item) => (
          <Card
            key={item.round}
            className={item.matchCount >= 3 ? 'border-2 border-yellow-400 bg-yellow-50/30' : ''}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{item.round}회</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  item.matchCount >= 4 ? 'bg-red-100 text-red-700' :
                  item.matchCount >= 3 ? 'bg-yellow-100 text-yellow-700' :
                  item.matchCount >= 2 ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.matchCount}개 적중!
                  {item.bonusMatch && ' +보너스'}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">AI 추천번호</p>
                <div className="flex gap-1.5 flex-wrap">
                  {item.predictedNumbers.map(n => (
                    <span
                      key={n}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.matchedNumbers.includes(n)
                          ? 'bg-red-500 text-white ring-2 ring-red-300'
                          : n === item.bonusNumber
                          ? 'bg-yellow-400 text-white ring-2 ring-yellow-300'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">실제 당첨번호</p>
                <LottoNumbers numbers={item.actualNumbers} bonusNumber={item.bonusNumber} size="xs" />
              </div>

              {item.matchedNumbers.length > 0 && (
                <p className="text-sm text-green-700">
                  적중 번호: <strong>{item.matchedNumbers.join(', ')}</strong>
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {loading && (
        <Card className="text-center py-12">
          <p className="text-gray-500">적중 기록을 불러오는 중...</p>
        </Card>
      )}

      {!loading && results.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500">아직 적중 기록이 없습니다.</p>
        </Card>
      )}
    </>
  );
}
