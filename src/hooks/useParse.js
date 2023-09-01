import { useFormats } from "./useFormats";

const parseInscrito = (inscrito) => {
  const { formatNome } = useFormats();

  inscrito.nome = formatNome(inscrito.nome)
  
  return inscrito
}

const parseFirebaseObject = (firebaseObject) => {
  if (!firebaseObject) return null;

  let [id, values] = Object
    .entries(firebaseObject)
    .pop();

  return {id, ...values};
}

const parseFirebaseObjects = (firebaseObjects) => {
  if (!firebaseObjects) return null;
  
  let values = Object
        .entries(firebaseObjects)
        .map(([id, value]) => ({...value, id}));

  return values;
}

export const useParse = () => ({
  parseInscrito,
  parseFirebaseObject,
  parseFirebaseObjects
})