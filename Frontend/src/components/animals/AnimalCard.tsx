import { Link } from 'react-router-dom'
import { Animal } from '../../types'
import { RiskBadge } from '../ui/RiskBadge'
import { Thermometer, Activity, Droplets, ChevronRight } from 'lucide-react'

interface AnimalCardProps {
  animal: Animal
}

export const AnimalCard = ({ animal }: AnimalCardProps) => {
  return (
    <Link
      to={`/animals/${animal.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {animal.name}
            </h3>
            <span className="text-xs text-slate-400">({animal.id})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{animal.breed} • {animal.age} yrs • {animal.farm}</p>
        </div>
        <RiskBadge level={animal.riskLevel} />
      </div>

      {/* Sensor snapshot */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Thermometer className="h-3.5 w-3.5 text-amber-500" />
          <span>{animal.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Activity className="h-3.5 w-3.5 text-sky-500" />
          <span>{animal.activity} act</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Droplets className="h-3.5 w-3.5 text-emerald-500" />
          <span>{animal.milkConductivity} mS</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        <span>Score: <strong className="text-slate-700">{animal.riskScore}%</strong></span>
        <span className="flex items-center gap-1 text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
          View Profile <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
