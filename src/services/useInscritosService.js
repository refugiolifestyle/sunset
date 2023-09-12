import { onValue, push, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { firebaseDatabase } from "../configs/firebase";
import { useInscrito } from "../hooks/useInscrito";
import { useParse } from "../hooks/useParse";

export const useInscritosService = () => {
  const [inscritos, setInscritos] = useState([])
  const [loading, setLoading] = useState(true)
  const {parseFirebaseObjects} = useParse();


  useEffect(() => {
    let query = ref(firebaseDatabase, 'inscricoes')
    return onValue(query, async (snapshot) => {
      let values = parseFirebaseObjects(snapshot.val());

      window.inscritos = values

      setInscritos(values)
      setLoading(false);
    }, () => setLoading(false))
  }, [])

  return {
    inscritos,
    loading
  }
}