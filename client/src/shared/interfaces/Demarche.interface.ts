export interface IDemarcheMappingColonne {
  id: number;
  labelSource: string[]; // ["PJ1"], if is sub champs ["BR","S_PJ1"]
  labelBN: string; // "Titre BN"
  typeName: string // "PieceJustificativeChamp"
  typeData: string; // "champ" or "annotation"
  typeValue: string; // ["Texte","Numero", "Date", "PJ"]
}
