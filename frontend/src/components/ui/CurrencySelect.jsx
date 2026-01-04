import { useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const currencies = [
  { id: 'USDC', name: 'USDC (Circle)', emoji: '💵' },
  { id: 'EURC', name: 'EURC (Circle)', emoji: '💶' },
]

export default function CurrencySelect({ value, onChange, compact }) {
  const [selected, setSelected] = useState(currencies[0])

  const handleChange = (currency) => {
    setSelected(currency)
    if (onChange) onChange(currency.id)
  }

  return (
    <Listbox value={selected} onChange={handleChange}>
      <div className="relative">
        <Listbox.Button className={`relative w-full bg-slate-900/50 border-2 border-slate-700/20 rounded-2xl text-white text-left focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer ${compact ? 'h-[52px] px-3' : 'h-[60px] px-4'}`}>
          <span className={`flex items-center gap-2 font-bold ${compact ? 'text-base' : 'text-lg'}`}>
            {selected.emoji} {selected.name}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl focus:outline-none">
            {currencies.map((currency) => (
              <Listbox.Option
                key={currency.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none transition-all ${compact ? 'px-3 py-3' : 'px-4 py-4'} ${active ? 'bg-slate-800/50' : ''
                  }`
                }
                value={currency}
              >
                {({ selected, active }) => (
                  <div
                    className={`flex items-center justify-between ${selected
                        ? 'bg-blue-500/8 border-l-4 border-blue-500 pl-3 font-semibold'
                        : 'border-l-4 border-transparent'
                      }`}
                  >
                    <span className={`flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'} ${selected ? 'text-cyan-400' : 'text-white'}`}>
                      {currency.emoji} {currency.name}
                    </span>
                    {selected && <span className="text-cyan-400 font-bold">✓</span>}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
