import { Link } from 'react-router-dom'
import { Animal } from '../../types'
import { RiskBadge } from '../ui/RiskBadge'
import { ChevronRight } from 'lucide-react'

interface AnimalTableProps {
  animals: Animal[]
}

export const AnimalTable = ({ animals }: AnimalTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
          <tr>
            <th scope="col" className="px-6 py-4">Animal / Tag</th>
            <th scope="col" className="px-6 py-4">Breed & Location</th>
            <th scope="col" className="px-6 py-4">Temp (°C)</th>
            <th scope="col" className="px-6 py-4">Activity</th>
            <th scope="col" className="px-6 py-4">Conductivity</th>
            <th scope="col" className="px-6 py-4">Risk Score</th>
            <th scope="col" className="px-6 py-4">Status</th>
            <th scope="col" className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {animals.map((animal) => (
            <tr
              key={animal.id}
              className="hover:bg-slate-50/80 transition-colors"
            >
              <td className="px-6 py-4">
                <div>
                  <p className="font-bold text-slate-900">{animal.name}</p>
                  <p className="text-xs text-slate-400">ID: {animal.id}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs font-medium text-slate-800">{animal.breed}</p>
                <p className="text-[11px] text-slate-400">{animal.farm}</p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`font-semibold ${
                    animal.temperature > 39.3
                      ? 'text-red-600 font-bold'
                      : animal.temperature > 39.0
                      ? 'text-amber-600'
                      : 'text-slate-700'
                  }`}
                >
                  {animal.temperature}°C
                </span>
              </td>
              <td className="px-6 py-4">{animal.activity} index</td>
              <td className="px-6 py-4">
                <span
                  className={`font-semibold ${
                    animal.milkConductivity > 6.0
                      ? 'text-red-600 font-bold'
                      : animal.milkConductivity > 5.5
                      ? 'text-amber-600'
                      : 'text-slate-700'
                  }`}
                >
                  {animal.milkConductivity} mS/cm
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${
                        animal.riskScore >= 70
                          ? 'bg-red-500'
                          : animal.riskScore >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${animal.riskScore}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900">{animal.riskScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <RiskBadge level={animal.riskLevel} size="sm" />
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/animals/${animal.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
