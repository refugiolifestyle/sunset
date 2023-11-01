import { get, ref } from "firebase/database"
import { useCallback, useMemo, useState } from "react"
import { firebaseDatabase } from "../configs/firebase"

export const useRedesService = (full = false) => {
  let [redeRef, setRedeRef] = useState(null);
  let [celulasObject, setCelulasObject] = useState([]);

  useMemo(async () => {
    let celulasFirebase = await get(ref(firebaseDatabase, 'celulas'))
    setCelulasObject(celulasFirebase.val())
  }, [])

  let celulas = (!redeRef ? celulasObject : celulasObject.filter(c => c.rede == redeRef))
    .reduce((a, c) => a.includes(c.celula) ? a : [...a, c.celula], [])

  let redes = celulasObject
    .reduce((a, r) => a.includes(r.rede) ? a : [...a, r.rede], [])
    .map(r => `Rede ${r}`)

  let sorter = new Intl.Collator([], { numeric: true });
  redes.sort(sorter.compare)
  celulas.sort(sorter.compare)

  if (full) {
    celulas.unshift('Sem célula')
    redes.unshift('Sem rede')
  }


  return {
    redes,
    celulas,
    setRedeRef
  }
}