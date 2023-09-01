const redes = Array.from({ length: 17 }, (_, rede) => `Rede ${rede + 3}`)
const celulas = Array.from({ length: 140 }, (_, celula) => `Refúgio ${++celula}`)

  export const useRedesService = () => ({
    redes,
    celulas
  })