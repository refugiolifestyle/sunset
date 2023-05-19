import { useFormats } from "./useFormats";

const parse = (inscrito) => {
  const { formatNome } = useFormats();

  inscrito.nome = formatNome(inscrito.nome)
  
  return inscrito
}

export const useInscrito = () => ({
  parse
})