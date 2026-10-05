import { Alert } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'

interface AlertCardProps {
  alert: Alert
  onAcknowledge?: (id: string) => void
}

export const AlertCard = ({ alert, onAcknowledge }: AlertCardProps) => {
  const getIcon = () => {
    if (alert.severity === 'HIGH') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
    if (alert.severity === 'MEDIUM') {
      return <AlertCircle className="h-5 w-5 text-amber-600" />
    }
    return <Info className="h-5 w-5 text-sky-600" />
  }

  const getSeverityBadge = () => {
    if (alert.severity === 'HIGH') return <Badge variant="destructive">HIGH SEVERITY</Badge>
    if (alert.severity === 'MEDIUM') return <Badge variant="warning">MEDIUM SEVERITY</Badge>
    return <Badge variant="info">INFO</Badge>
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        alert.read
          ? 'border-slate-200 bg-white opacity-85'
          : alert.severity === 'HIGH'
          ? 'border-red-200 bg-red-50/30 shadow-sm'
          : alert.severity === 'MEDIUM'
          ? 'border-amber-200 bg-amber-50/30 shadow-sm'
          : 'border-slate-200 bg-slate-50/50 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-white p-2 shadow-xs border border-slate-100">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {getSeverityBadge()}
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {alert.type}
              </span>
              <span className="text-xs text-slate-400">• {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{alert.message}</p>
            <p className="mt-1 text-xs text-slate-500">Target Animal ID: <strong>{alert.animalId}</strong></p>
          </div>
        </div>

        <div>
          {!alert.read ? (
            onAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(alert.id)}
                className="text-xs"
              >
                Mark Read
              </Button>
            )
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Read
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
