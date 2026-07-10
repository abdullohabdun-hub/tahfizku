import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '../../components/ui/card'
import { Wrench } from 'lucide-react'

export const Route = createFileRoute('/santri/profil')({
  component: ProfilPage,
})

function ProfilPage() {
  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-xl font-bold text-slate-800">Profil Santri</h1>
      <Card className="border-slate-200 shadow-sm border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Dalam Tahap Pengembangan</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Fitur Profil untuk santri sedang dalam tahap pengembangan dan akan segera hadir.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
