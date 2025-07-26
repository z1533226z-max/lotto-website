// src/app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - 로또 AI 예측',
  description: '로또 AI 예측 서비스의 개인정보처리방침입니다.',
  keywords: '개인정보처리방침, 로또, 프라이버시, 정책',
  openGraph: {
    title: '개인정보처리방침 - 로또 AI 예측',
    description: '로또 AI 예측 서비스의 개인정보처리방침입니다.',
    url: 'https://lotto.gon.ai.kr/privacy',
    siteName: '로또 AI 예측',
    type: 'website',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            개인정보처리방침
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
                제1조 (개인정보의 처리목적)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                로또 AI 예측 서비스(&apos;lotto.gon.ai.kr&apos;, 이하 &apos;서비스&apos;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>서비스 제공 및 운영</li>
                <li>사용자 맞춤형 서비스 제공</li>
                <li>서비스 품질 개선 및 통계 분석</li>
                <li>광고 서비스 제공 (Google AdSense)</li>
                <li>법령상 의무이행</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제2조 (처리하는 개인정보 항목)
              </h2>
              <div className="text-gray-700">
                <h3 className="text-lg font-medium mb-2">필수항목:</h3>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>IP 주소</li>
                  <li>쿠키 및 접속 로그</li>
                  <li>서비스 이용 기록</li>
                  <li>기기 정보 (브라우저 종류, OS 등)</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2">Google AdSense 관련:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>광고 클릭 정보</li>
                  <li>광고 노출 데이터</li>
                  <li>사용자 관심사 정보</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제3조 (개인정보의 처리 및 보유기간)
              </h2>
              <div className="text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>접속 로그:</strong> 3개월</li>
                  <li><strong>쿠키:</strong> 브라우저 종료 시 또는 1년</li>
                  <li><strong>서비스 이용 기록:</strong> 1년</li>
                  <li><strong>광고 관련 데이터:</strong> Google AdSense 정책에 따름</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제4조 (개인정보의 제3자 제공)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                본 서비스는 다음의 경우를 제외하고는 개인정보를 제3자에게 제공하지 않습니다:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Google AdSense 광고 서비스 제공을 위한 Google에 제공</li>
                <li>법령의 규정에 의한 경우</li>
                <li>정보주체의 동의가 있는 경우</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                제5조 (쿠키 사용에 대한 안내)
              </h2>
              <div className="text-gray-700">
                <p className="mb-4">본 서비스는 다음의 목적으로 쿠키를 사용합니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>사용자 설정 저장</li>
                  <li>서비스 이용 통계 분석</li>
                  <li>맞춤형 광고 제공</li>
                  <li>서비스 품질 개선</li>
                </ul>
                <p className="mt-4">
                  사용자는 브라우저 설정을 통해 쿠키 허용 여부를 선택할 수 있습니다.
                </p>
              </div>
            </section>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                본 개인정보처리방침은 2025년 7월 27일부터 적용됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
