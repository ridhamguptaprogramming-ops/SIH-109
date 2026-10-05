import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Animal, RiskLevel } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { AnimalTable } from '../components/animals/AnimalTable'
import { AnimalCard } from '../components/animals/AnimalCard'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { Search, Filter, RefreshCw } from 'lucide-react'

export const AnimalsPage = () => {
  const [loading, setLoading] = useState(true)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('ALL')

  const fetchAnimals = async () => {
    setLoading(true)
    try {
      const data = await api.getAnimals()
      setAnimals(data)
    } catch (err) {
      console.error('Failed to load animals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimals()
  }, [])

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.farm.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRisk = riskFilter === 'ALL' || animal.riskLevel === (riskFilter as RiskLevel)

    return matchesSearch && matchesRisk
  })

  if (loading) {
    return <LoadingState message="Fetching registered herd records..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Herd Monitoring & Registry"
        description="Continuous early-warning telemetry tracking for registered dairy cows and buffaloes."
        action={
          <button
            onClick={fetchAnimals}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
          </button>
        }
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by animal name, ID, breed or farm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Filter Risk:</span>
          <div className="flex items-center gap-1">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  riskFilter === level
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {filteredAnimals.length === 0 ? (
        <EmptyState
          title="No Animals Found"
          description="No animals match the specified search query or risk level filter."
          action={
            <button
              onClick={() => {
                setSearchQuery('')
                setRiskFilter('ALL')
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <AnimalTable animals={filteredAnimals} />
          </div>

          {/* Mobile & Tablet Card Grid View */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filteredAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
