import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-gray-800">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-600">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
