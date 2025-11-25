import { Metadata } from 'next'
import SeasonPass from '@/components/SeasonPass'

export const metadata: Metadata = {
  title: 'Season Pass - Dashboard NyxBot',
  description: 'Découvrez et réclamez vos récompenses du season pass',
}

export default function SeasonPassPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <SeasonPass />
      </div>
    </div>
  )
}