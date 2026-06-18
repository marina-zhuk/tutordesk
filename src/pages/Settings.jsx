import { useConfig } from '../context/useConfig'
import { NICHE_LIST } from '../data/config'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

export default function Settings() {
  const { nicheId, setNiche } = useConfig()

  return (
    <div>
      <PageHeader title="Настройки" subtitle="Профиль бизнеса — демонстрация адаптации под нишу" />

      <Card className="p-4 sm:p-6">
        <h2 className="text-sm font-medium text-slate-700">Ниша бизнеса</h2>
        <p className="mt-1 text-sm text-slate-500">
          Переключите профиль — мгновенно изменятся название, подписи и демо-данные. Так одно и то же
          приложение адаптируется под бизнес клиента (репетитор, студия красоты, фитнес).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {NICHE_LIST.map((n) => {
            const active = n.id === nicheId
            return (
              <button
                key={n.id}
                onClick={() => setNiche(n.id)}
                aria-pressed={active}
                className={[
                  'rounded-xl border p-4 text-left transition-colors',
                  active
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{n.title}</span>
                  {active && <span className="text-xs font-medium text-indigo-600">Активно</span>}
                </div>
                <div className="mt-1 truncate text-sm text-slate-500">{n.appName}</div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {n.services.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        Демо-данные генерируются на лету и сбрасываются при перезагрузке. Бэкенда, авторизации и оплаты нет.
      </p>
    </div>
  )
}
