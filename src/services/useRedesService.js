const redes = () =>
  Array.from({ length: 19 }, (_, rede) => `Rede ${++rede}`)

const celulas = () =>
  Array.from({ length: 122 }, (_, celula) => `Célula ${++celula}`)

  export const useRedesService = () => ({
    redes,
    celulas
  })