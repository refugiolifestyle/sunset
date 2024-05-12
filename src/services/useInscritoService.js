import { equalTo, get, onValue, orderByChild, query, ref } from "firebase/database";
import { useCallback, useState } from "react";
import { firebaseDatabase } from "../configs/firebase";
import { useParse } from "../hooks/useParse";

export const useInscritoService = () => {
  const [loading, setLoading] = useState(false)
  const [inscrito, setInscrito] = useState(null)
  const { parseFirebaseObject } = useParse();


  const search = useCallback(async cpf => {
    setLoading(true);

    let refer = ref(firebaseDatabase, `inscricoes`)
    let search = query(refer, orderByChild('cpf'), equalTo(cpf));

    let unSubscribe = onValue(search, snapshot => {
      let inscritoParsed = parseFirebaseObject(snapshot.val());

      setInscrito(inscritoParsed);
      setLoading(false);
      unSubscribe();
    })
  }, [])

  return {
    search,
    inscrito,
    loading
  }
}