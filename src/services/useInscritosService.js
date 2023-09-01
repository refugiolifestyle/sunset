import { onValue, push, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { firebaseDatabase } from "../configs/firebase";
import { useInscrito } from "../hooks/useInscrito";
import { useParse } from "../hooks/useParse";

export const useInscritosService = () => {
  const [inscritos, setInscritos] = useState([])
  const [loading, setLoading] = useState(true)
  const {parseFirebaseObject} = useParse();


  useEffect(() => {
    let query = ref(firebaseDatabase, 'inscricoes')
    return onValue(query, async (snapshot) => {
      let values = parseFirebaseObject(snapshot.val());

      setInscritos(values)
      setLoading(false);
    }, () => setLoading(false))
  }, [])

  return {
    inscritos,
    loading
  }
}