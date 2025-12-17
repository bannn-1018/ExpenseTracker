import { formatCurrency } from '@/lib/utils/currency'
import type { SpendingForecast } from '@/lib/db/analytics'

interface SpendingForecastCardProps {
  forecast: SpendingForecast | null
}

export default function SpendingForecastCard({ forecast }: SpendingForecastCardProps) {
  if (!forecast) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Dự báo chi tiêu tháng này</h3>
        <div className="text-center text-gray-500 py-8">
          Cần ít nhất 3 ngày dữ liệu để tạo dự báo
        </div>
      </div>
    )
  }

  const percentUsed = (forecast.currentMonthSpent / forecast.projectedEndOfMonth) * 100
  const percentTimeUsed = (forecast.daysPassed / forecast.daysInMonth) * 100
  const onTrack = percentUsed <= percentTimeUsed + 10

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dự báo chi tiêu tháng này</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          forecast.confidence === 'high' 
            ? 'bg-green-100 text-green-700'
            : forecast.confidence === 'medium'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          Độ tin cậy: {
            forecast.confidence === 'high' ? 'Cao' :
            forecast.confidence === 'medium' ? 'Trung bình' : 'Thấp'
          }
        </span>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              Đã chi: {formatCurrency(forecast.currentMonthSpent)}
            </span>
            <span className="text-gray-600">
              Ngày {forecast.daysPassed}/{forecast.daysInMonth}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all ${
                onTrack ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{percentUsed.toFixed(1)}% đã chi</span>
            <span>{percentTimeUsed.toFixed(1)}% thời gian đã qua</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Trung bình mỗi ngày</p>
            <p className="text-lg font-bold">{formatCurrency(forecast.dailyAverage)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Dự kiến cuối tháng</p>
            <p className="text-lg font-bold">{formatCurrency(forecast.projectedEndOfMonth)}</p>
          </div>
        </div>

        {/* Projected Balance */}
        <div className={`p-4 rounded-lg ${
          forecast.warning ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className="text-sm font-medium mb-1">
            {forecast.warning ? '⚠️ Cảnh báo' : '✓ Dự báo số dư'}
          </p>
          <p className={`text-2xl font-bold ${
            forecast.warning ? 'text-red-600' : 'text-blue-600'
          }`}>
            {formatCurrency(forecast.projectedBalance)}
          </p>
          {forecast.warning && (
            <p className="text-sm text-red-600 mt-2">
              Dự kiến chi tiêu vượt thu nhập. Hãy cân nhắc giảm chi tiêu!
            </p>
          )}
          {!forecast.warning && onTrack && (
            <p className="text-sm text-blue-600 mt-2">
              Bạn đang chi tiêu đúng kế hoạch. Tiếp tục duy trì!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
