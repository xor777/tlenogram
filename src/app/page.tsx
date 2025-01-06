import Tlenogram from '@/components/tlenogram'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tlenogram',
  description: 'Tlenogram is a tool for creating tlenograms.',
}

export default function Home() {
  return <Tlenogram />
}
