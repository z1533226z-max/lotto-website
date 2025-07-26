// src/app/terms/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 - 로또 AI 예측',
  description: '로또 AI 예측 서비스의 이용약관입니다.',
  keywords: '이용약관, 로또, 서비스 약관, 이용규칙',
  openGraph: {
    title: '이용약관 - 로또 AI 예측',
    description: '로또 AI 예측 서비스의 이용약관입니다.',
    url: 'https://lotto.gon.ai.kr/terms',
    siteName: '로또 AI 예측',
    type: 'website',
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            이용약관
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>시행일자:</strong> 2025년 7월 27일<br />
                <strong>최종 수정일:</strong> 2025년 7월 27일
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제1조 (목적)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관은 로또 AI 예측 서비스('lotto.gon.ai.kr', 이하 '서비스')를 이용함에 있어 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제2조 (정의)
              </h2>
              <div className="text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"서비스"</strong>란 로또 번호 예측, 통계 분석, 당첨 정보 제공 등의 서비스를 의미합니다.</li>
                  <li><strong>"이용자"</strong>란 이 약관에 따라 서비스를 이용하는 개인 또는 법인을 의미합니다.</li>
                  <li><strong>"콘텐츠"</strong>란 서비스에서 제공하는 로또 관련 정보, 예측 데이터, 통계 자료 등을 의미합니다.</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제3조 (약관의 명시와 설명 및 개정)
              </h2>
              <div className="text-gray-700">
                <p className="mb-4">
                  1. 서비스는 이 약관의 내용과 상호, 영업소 소재지, 연락처 등을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
                </p>
                <p className="mb-4">
                  2. 서비스는 필요한 경우 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
                </p>
                <p>
                  3. 약관이 개정되는 경우 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
                </p>
              </div>
            </section>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                본 이용약관은 2025년 7월 27일부터 적용됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}