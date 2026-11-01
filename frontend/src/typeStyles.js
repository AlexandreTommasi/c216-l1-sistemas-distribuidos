// Classes completas (sem concatenação) para o Tailwind enxergar cada uma.
const FALLBACK = {
  chip: "bg-stone-100 text-stone-700 border-stone-400",
  selected: "bg-stone-600 text-white border-stone-700",
  ring: "peer-focus-visible:ring-stone-600",
};

export const TYPE_STYLES = {
  Fogo: {
    chip: "bg-orange-100 text-orange-900 border-orange-400",
    selected: "bg-orange-600 text-white border-orange-700",
    ring: "peer-focus-visible:ring-orange-600",
  },
  Água: {
    chip: "bg-blue-100 text-blue-900 border-blue-400",
    selected: "bg-blue-600 text-white border-blue-700",
    ring: "peer-focus-visible:ring-blue-600",
  },
  Grama: {
    chip: "bg-green-100 text-green-900 border-green-400",
    selected: "bg-green-700 text-white border-green-800",
    ring: "peer-focus-visible:ring-green-700",
  },
  Elétrico: {
    chip: "bg-yellow-100 text-yellow-900 border-yellow-400",
    selected: "bg-yellow-400 text-yellow-950 border-yellow-600",
    ring: "peer-focus-visible:ring-yellow-600",
  },
  Normal: {
    chip: "bg-stone-100 text-stone-800 border-stone-400",
    selected: "bg-stone-600 text-white border-stone-700",
    ring: "peer-focus-visible:ring-stone-600",
  },
  Voador: {
    chip: "bg-indigo-100 text-indigo-900 border-indigo-300",
    selected: "bg-indigo-500 text-white border-indigo-700",
    ring: "peer-focus-visible:ring-indigo-600",
  },
  Veneno: {
    chip: "bg-purple-100 text-purple-900 border-purple-400",
    selected: "bg-purple-700 text-white border-purple-800",
    ring: "peer-focus-visible:ring-purple-700",
  },
  Fada: {
    chip: "bg-pink-100 text-pink-900 border-pink-300",
    selected: "bg-pink-400 text-pink-950 border-pink-600",
    ring: "peer-focus-visible:ring-pink-600",
  },
  Psíquico: {
    chip: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-400",
    selected: "bg-fuchsia-600 text-white border-fuchsia-800",
    ring: "peer-focus-visible:ring-fuchsia-600",
  },
  Pedra: {
    chip: "bg-amber-100 text-amber-900 border-amber-500",
    selected: "bg-amber-700 text-white border-amber-900",
    ring: "peer-focus-visible:ring-amber-700",
  },
  Terra: {
    chip: "bg-yellow-100 text-yellow-900 border-yellow-600",
    selected: "bg-yellow-700 text-white border-yellow-900",
    ring: "peer-focus-visible:ring-yellow-700",
  },
  Lutador: {
    chip: "bg-red-100 text-red-900 border-red-400",
    selected: "bg-red-700 text-white border-red-900",
    ring: "peer-focus-visible:ring-red-700",
  },
};

export function getTypeStyle(tipo) {
  return TYPE_STYLES[tipo] ?? FALLBACK;
}
