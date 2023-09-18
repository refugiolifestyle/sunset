export const useRedesService = (full = false) => {
  let redes = Array.from({ length: 17 }, (_, rede) => `Rede ${rede + 3}`)
  let celulas = Array.from({ length: 140 }, (_, celula) => `Refúgio ${++celula}`)

  if (full) {
    redes =  ['Sem rede', ...redes]
    celulas = ['Sem célula', ...celulas]
  }

  return {
    redes,
    celulas
  }
}