import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🎲</span>
              <span className="text-xl font-bold">로또킹</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI 기반 로또번호 추천 서비스<br />
              행운의 번호를 찾아드립니다
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/#generator" className="hover:text-white transition-colors">AI 번호 추천</Link></li>
              <li><Link href="/lotto/list" className="hover:text-white transition-colors">당첨번호 조회</Link></li>
              <li><Link href="/lotto/statistics" className="hover:text-white transition-colors">통계 분석</Link></li>
              <li><Link href="/lotto/calculator" className="hover:text-white transition-colors">세금 계산기</Link></li>
              <li><Link href="/lotto/rankings" className="hover:text-white transition-colors">역대 당첨금 순위</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">정보</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 로또킹. All rights reserved.</p>
          <p className="mt-2">
            본 서비스는 오락목적으로 제공되며, 실제 당첨을 보장하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
