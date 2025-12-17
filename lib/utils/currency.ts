export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatCompactCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  
  if (absAmount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B ₫`
  }
  
  if (absAmount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ₫`
  }
  
  if (absAmount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K ₫`
  }
  
  return `${amount} ₫`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}
